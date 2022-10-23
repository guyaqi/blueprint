import { PythonVersion } from "./common"
import { pythonResolver } from './resolver'
import { pythonAst } from './ast'
import { os } from "../os"
import { pythonExecLocal } from "./execLocal"
import * as file from '../fm'

type PyFunctionExport = {
  name: string
  ast: pythonAst.FunctionDef
}

type PyClassExport = {
  name: string
  ast: pythonAst.ClassDef
}

type PyVarExport = {
  name: string
  ast: pythonAst.AnnAssign | pythonAst.Assign
}

type PyReexport = {
  name: string
  ast: pythonAst.Import|pythonAst.ImportFrom
}

export class PyExports {
  funcs: PyFunctionExport[]
  classes: PyClassExport[]
  vars: PyVarExport[]
  reimports: PyReexport[]

  constructor(
    funcs: PyFunctionExport[],
    classes: PyClassExport[],
    vars: PyVarExport[],
    reimports: PyReexport[],
  ) {
    this.funcs = funcs
    this.classes = classes
    this.vars = vars
    this.reimports = reimports
  }

  allNames(): string[] {
    const a = this.funcs.map(x => x.name)
    const b = this.classes.map(x => x.name)
    const c = this.vars.map(x => x.name)
    const d = this.reimports.map(x => x.name)
    return a.concat(b).concat(c).concat(c)
  }
}

export class SymbolRoot {

  // resolve
  version?: PythonVersion
  platform?: string
  modules = [] as string[]
  paths = new Map<string, string>()
  asts = new Map<string, pythonAst.Module>()

  priorities = new Map<string, number>()
  exports = new Map<string, PyExports>()

  
  private get _stdTypeShedPath() {
    return file.path.join(process.env.PUBLIC!, 'python', 'typeshed', 'stdlib')
  }

  _getExports(m: pythonAst.Module): PyExports {
    const rootNames = pythonAst.exportChecker.getRootNames(m)
    // console.log('All root symbols: ', rootNames)

    const funcs = [] as { name: string, ast: pythonAst.FunctionDef }[]
    const classes = [] as { name: string, ast: pythonAst.ClassDef }[]
    const vars = [] as { name: string, ast: (pythonAst.AnnAssign|pythonAst.Assign) }[]
    const reimports = [] as { name: string, ast: (pythonAst.Import|pythonAst.ImportFrom) }[]
    const exportedNames = new Set<string>()

    for (const n of m.body) {
      const isFunction = n.__python_type_name == 'FunctionDef' || n.__python_type_name == 'AsyncFunctionDef'
      const isClass = n.__python_type_name == 'ClassDef'
      const isVar = n.__python_type_name == 'AnnAssign' || n.__python_type_name == 'Assign'
      const isImport = n.__python_type_name == 'Import' || n.__python_type_name == 'ImportFrom'
      
      if (isFunction && rootNames.includes((n as pythonAst.FunctionDef).name)) {
        const _n = n as pythonAst.FunctionDef
        funcs.push({
          name: _n.name,
          ast: _n,
        })
        exportedNames.add(_n.name)
      }
      else if (isClass && rootNames.includes((n as pythonAst.ClassDef).name)) {
        const _n = n as pythonAst.ClassDef
        classes.push({
          name: _n.name,
          ast: _n,
        })
        exportedNames.add(_n.name)
      }
      else if (isVar) {
        // const _n = n as pythonAst.AnnAssign | pythonAst.Assign
        if (n.__python_type_name == 'AnnAssign') {
          const _n = n as pythonAst.AnnAssign
          const target = _n.target
          if (target.__python_type_name == 'Name') {
            const _target = target as pythonAst.Name
            if (rootNames.includes(_target.id)) {
              vars.push({
                name: _target.id,
                ast: _n,
              })
              exportedNames.add(_target.id)
            }
          }
        }
        else {
          const _n = n as pythonAst.Assign
          const target = _n.targets[0]
          if (target.__python_type_name == 'Name') {
            const _target = target as pythonAst.Name
            if (rootNames.includes(_target.id)) {
              vars.push({
                name: _target.id,
                ast: _n,
              })
              exportedNames.add(_target.id)
            }
          }
        }
        
      }
      else if(isImport) {
        if (n.__python_type_name == 'Import') {
          const _n = n as pythonAst.Import
          for (const name of _n.names) {
            const aliasRes = name.asname ? name.asname : name.name
            if (rootNames.includes(aliasRes)) {
              reimports.push({
                name: aliasRes,
                ast: _n,
              })
              exportedNames.add(aliasRes)
            }
          }
        }
        else {
          const _n = n as pythonAst.ImportFrom
          for (const name of _n.names) {
            const aliasRes = name.asname ? name.asname : name.name
            if (rootNames.includes(aliasRes)) {
              reimports.push({
                name: aliasRes,
                ast: _n,
              })
              exportedNames.add(aliasRes)
            }
          }
        }
      }
    }

    // since override with cause one name exported multitimes, simply
    // compare length of "exportedNames" and "rootNames" sometime cause an error.
    // we need to check every name
    const failedNames: string[] = []
    for (const s of rootNames) {
      if (!exportedNames.has(s)) {
        failedNames.push(s)
        
      }
    }
    if (failedNames.length) {
      console.warn('not exported: ', failedNames)
      console.log('root: ', m)
      throw new Error('getExports: partial exports')
    }
    else {
      console.log('All reference exported successfully! 😀')
    }

    return new PyExports(
      funcs,
      classes,
      vars,
      reimports,
    )
  }

  resolveModule(name: string, ast: pythonAst.Module): PyExports {
    const _expandCrazyImportInline = (m: pythonAst.Module, name: string) => {
      for(const n of m.body) {
        if (n.__python_type_name == 'ImportFrom') {
          const _n = n as pythonAst.ImportFrom
          if (_n.names[0].name == '*') {
            // 展开智障Import
            let importModule: string
            if (_n.level == 0) {
              importModule = _n.module
            }
            else if (_n.level == 1) {
              importModule = `${name}.${_n.module}`
            }
            else {
              console.error(_n)
              throw new Error(`_expandCrazyImportInline: too deep import`)
            }
            
            const targetExports = this.exports.get(importModule)
            if (!targetExports) {
              console.error(name,m)
              throw new Error(`target module "${importModule}" has not been resolved`)
            }
            const targetNames = targetExports.allNames()
            _n.names = targetNames.map(x => ({ name: x, __python_type_name: 'alias' }))
          }
        }
      }
    }
    // check cache
    const cacheKey = `py-mod-resolve-${name}`
    const cache = window.localStorage.getItem(cacheKey)
    if (cache !== null) {
      const _cache = JSON.parse(cache)
      return new PyExports(_cache.funcs, _cache.classes, _cache.vars, _cache.reimports)
    }

    _expandCrazyImportInline(ast, name)
    // cache
    const res = this._getExports(ast)
    window.localStorage.setItem(cacheKey, JSON.stringify(res))

    return res
  }
  
  async execTool(toolName: string, param: string): Promise<any> {
    const toolPath = file.path.join(process.env.PUBLIC!, 'python', 'src', `${toolName}.py`)
    // await python.value.init()
    const stdout = await pythonExecLocal.exec(`${toolPath} ${param}`)
    try {
      const res = JSON.parse(stdout)
      return res
    }
    catch (err) {
      console.error('error when execTool')
      console.error(err)
      return ''
    }
  }

  async modAst(modName: string, modulePath: string): Promise<pythonAst.Module> {

    // check cache
    const cacheKey = `py-mod-ast-${modName}`
    const cache = window.localStorage.getItem(cacheKey)
    if (cache !== null) {
      return JSON.parse(cache)
    }

    // cache
    const res = await this.execTool('resolve_module', modulePath)
    window.localStorage.setItem(cacheKey, JSON.stringify(res))
    return res
  }

  async _initPythonVersion() {
    /**
     * get version of python
     */
    try {
      const stdout = await pythonExecLocal.exec('--version')
      const vt = stdout.match(/[\d]+\.[\d]+\.[\d]+/)![0]
      console.log(`Python version: ${vt}`)
      const v = vt.split('.').map(x => parseInt(x))
      this.version = new PythonVersion(v)
    }
    catch (err) {
      console.error('error when get python version')
      console.error(err)
    }
  }
  async _initPythonPlatform() {
    /**
     * get platform of python
     * python -c "import sys;print(sys.platform)"
     */
     try {
      const stdout = await pythonExecLocal.exec(`-c "import sys;print(sys.platform)"`)
      this.platform = stdout
    }
    catch (err) {
      console.error('error when get python version')
      console.error(err)
    }
  }
  async _initModulesPathsAsts() {
    const res = await pythonResolver.outer.treeResolve(this._stdTypeShedPath)
    const modulePaths = res.toFlat()
    const asts = await Promise.all(modulePaths.map(x => this.modAst(x.name, x.path)))
    this.modules = modulePaths.map(x => x.name)
    modulePaths.forEach(item => {
      this.paths.set(item.name, item.path)
    })
    asts.forEach((item, i) => {
      this.asts.set(modulePaths[i].name, item)
    })
  }
  async _initAstEnvironmentExpand() {
    for(const ast of this.asts.values()) {
      pythonAst.environmentVerify.recursiveExpandVerifyNodeInline(ast, this.platform!, this.version!)
    }
  }
  async _initPrioritiesAndSort() {
    // 获取一个节点使用的import*
    const getCrazyImport = (name: string, m: pythonAst.Module): string[] => {
      const res = []
      const arr = m.body.filter(x => x.__python_type_name == 'ImportFrom')
      for (const n of arr) {
        const _n = n as pythonAst.ImportFrom
        if (_n.names.length == 1 && _n.names[0].name == '*') {
          const src = _n.module
          if (_n.level == 0) {
            res.push(src)
          }
          else if (_n.level == 1) {
            res.push(`${name}.${src}`)
          }
          else {
            console.error('Unknow level ', _n.level, _n)
          }
        }
      }
      // console.log(`${name}: `, res)
      // if (name == 'asyncio') {
      //   setTimeout(() => {
      //     console.log(arr)
      //     console.log(m.body.filter(x => x.__python_type_name == 'ImportFrom'))
      //     console.log(m.body.filter(x => x.__python_type_name != 'ImportFrom'))
      //   }, 1000)
      // }
      return res
    }
    
    // 初始化
    for (const module of this.modules) {
      this.priorities.set(module, 0)
    }

    // 赋权
    const LOOP_LIMIT = 100
    for (let i=0;i<LOOP_LIMIT;i++) {

      const activated = this.modules.filter(m => this.priorities.get(m)! >= i)
      if (!activated.length) {
        break
      }

      for (const module of activated) {
        const ast = this.asts.get(module)
        const crazyImports = getCrazyImport(module, ast!)

        if (crazyImports.length) {
          // const selfPriority = this.priorities.get(module)!
          for (const item of crazyImports) {
            if (!this.priorities.has(item)) {
              console.error('from', module)
              console.error('crazyImports', crazyImports)
              throw new Error(`no module named ${item}`)
            }
            this.priorities.set(item, i+1)
          }
        }
        
      }

      if (i == LOOP_LIMIT-1) {
        throw new Error('_initPriorities failed LOOP_LIMIT reached')
      }
    }

    const prioritiesKv = [] as { name: string, priority: number }[]
    for (const [k, v] of this.priorities.entries()) {
      prioritiesKv.push({ name: k, priority: v })
    }
    prioritiesKv.sort((a, b) => b.priority - a.priority)
    // console.log('priorities', prioritiesKv.filter(x => x.priority != 0))

    const moduleNameSorted = prioritiesKv.map(x => x.name)
    this.modules = moduleNameSorted
    

    // debug show all priorities
    // const pair = [] as [string, number][]
    // this.priorities.forEach((v, k) => {
    //   pair.push([k, v])
    // })
    // pair.sort((a, b) => b[1] - a[1])
    
  }
  async _initExports() {
    for (let i = 0; i < this.modules.length; i++) {
      const name = this.modules[i]
      const path = this.paths.get(name)!
      const ast = this.asts.get(name)!
      // console.log(`===== ${name}`)
      const exports = this.resolveModule(name, ast)
      this.exports.set(name, exports)
      // console.log(`===== ${this.exports.size}/${this.modules.length}`)
    }
  }

  async resolveAll() {
    await this._initPythonVersion()
    await this._initPythonPlatform()
    await this._initModulesPathsAsts()
    await this._initAstEnvironmentExpand()
    await this._initPrioritiesAndSort()
    await this._initExports()
  }
}
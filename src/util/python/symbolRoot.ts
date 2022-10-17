import { PythonVersion } from "./common"
import { pythonResolver } from './resolver'
import { pythonAst } from './ast'
import { os } from "../os"
import { pythonExecLocal } from "./execLocal"

type ExternPythonCall = (param: string) => Promise<string>

export class SymbolRoot {

  // resolve
  version?: PythonVersion
  platform?: string
  modules = [] as string[]
  paths = new Map<string, string>()
  asts = new Map<string, pythonAst.Module>()

  priorities = new Map<string, number>()
  exports = new Map<string, pythonResolver.inner.PyExports>()

  
  private get _stdTypeShedPath() {
    return os.path.join(process.env.PUBLIC!, 'python', 'typeshed', 'stdlib')
  }

  resolveModule(modName: string, moduleAst: pythonAst.Module): pythonResolver.inner.PyExports {

    // check cache
    const cacheKey = `py-mod-resolve-${modName}`
    const cache = window.localStorage.getItem(cacheKey)
    if (cache !== null) {
      return JSON.parse(cache)
    }

    const pyAst: pythonAst.Module = moduleAst
    pythonAst.environmentVerify.recursiveExpandVerifyNodeInline(pyAst, this.platform!, this.version!)
    const resolver = new pythonResolver.inner.PyAstModuleResolver(pyAst)

    // cache
    const res = resolver.getExports()
    window.localStorage.setItem(cacheKey, JSON.stringify(res))

    return res
  }
  
  async execTool(toolName: string, param: string): Promise<any> {
    const toolPath = os.path.join(process.env.PUBLIC!, 'python', 'src', `${toolName}.py`)
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
    // this.modules = modulePaths.map(x => x.name)
    // modulePaths.forEach(item => {
    //   this.paths.set(item.name, item.path)
    // })
    // asts.forEach((item, i) => {
    //   this.asts.set(modulePaths[i].name, item)
    // })
  }
  async _initPriorities() {
    // 获取一个节点使用的import*
    const getCrazyImport = (m: pythonAst.Module): string[] => {
      const res = []
      const arr = m.body.filter(x => x.__python_type_name == 'ImportFrom')
      for (const n of arr) {
        const _n = n as pythonAst.ImportFrom
        if (_n.names.length == 1 && _n.names[0].name == '*') {
          const src = _n.module
          res.push(src)
        }
      }
      return res
    }
    
    // 初始化
    for (const module of this.modules) {
      this.priorities.set(module, 0)
    }

    // 赋权
    for (const module of this.modules) {
      const ast = this.asts.get(module)
      const crazyImports = getCrazyImport(ast!)
      for (const item of crazyImports) {
        if (!this.priorities.has(item)) {
          throw new Error(`no module named ${item}`)
        }
        this.priorities.set(item, this.priorities.get(item)! + 1)
      }
    }
  }

  async resolveAll() {
    await this._initPythonVersion()
    await this._initPythonPlatform()
    console.log('3')
    await this._initModulesPathsAsts()
    // console.log('4')
    // await this._initPriorities()

    // console.log(this.priorities)

    // const sorted = pythonResolver.inner.sortByReference(asts.map((item, i) => ({ name: modulePaths[i].name, ast: item })))

    // for (let i = 0; i < modulePaths.length; i++) {
    //   const { name, path } = modulePaths[i]
    //   // const name = modulePath.name
    //   console.log(`===== ${name}`)
    //   const exports = this.resolveModule(name, asts[i])
    //   moduleExports.set(name, exports)
    //   console.log(`===== ${moduleExports.size}/${modulePaths.length}`)
    // }
    // console.log(moduleExports)
  }
}
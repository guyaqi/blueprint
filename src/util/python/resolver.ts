// import { python } from './ast'

import { BaseTreeNode } from "../datastructure/tree"
import { os } from "../os"
import { pythonAst } from "./ast"

export namespace pythonResolver {

  export namespace outer {

    export type PyFlatModuleProfile = {
      name: string
      isPkg: boolean
      path: string
    }
  
    export class PyHierarchyNode implements BaseTreeNode {
      title: string
      isPkg: boolean
      path: string
      children?: PyHierarchyNode[]
  
      constructor(title: string, isPkg: boolean, path: string, children?: PyHierarchyNode[]) {
        this.title = title
        this.isPkg = isPkg
        this.children = children
        this.path = path
      }
  
      toFlat(): PyFlatModuleProfile[] {
        let res: PyFlatModuleProfile[] = []
        if (!this.isPkg && this.title) {
          res.push({ name: this.title, isPkg: false, path: this.path })
        }

        if (this.isPkg) {
          const __init__ = this.children!.find(x => x.title == '__init__')
          if (__init__) {
            res.push({ name: this.title, isPkg: true, path: __init__.path })
          }
          for (const child of this.children!.filter(x => x.title != '__init__')) {
            for (const item of child.toFlat()) {
              res.push({ ...item, name: `${this.title ? this.title + '.' : ''}${item.name}` })
            }
          }
        }
        return res
      }
    }

    export const _treeResolve = async (path: string, root: string): Promise<PyHierarchyNode> => {
      const isFile = path.endsWith('.pyi') || path.endsWith('.py')
      const pathArr = path.slice(root.length).split(/[\\/]/).filter(x => x != '')
      
      if (isFile) {
        const fname = pathArr[pathArr.length-1]
        let modname: string
        if (fname.endsWith('.pyi')) {
          modname = fname.slice(0, fname.length-'.pyi'.length)
        }
        else if (fname.endsWith('.py')) {
          modname = fname.slice(0, fname.length-'.py'.length)
        }
        else {
          throw new Error('error _treeResolve')
        }
        return new PyHierarchyNode(modname, false, path)
      }
      else {
        const pkgname = pathArr.length == 0 ? '' : pathArr[pathArr.length-1]
        
        let children = await os.ls(path)  
        const __init__ = _pick__init__(children)
        children = children.filter(x => x != '__init__.pyi' && x != '__init__.py')
        const fpChildren = children.map(x => os.path.join(path, x))

        const nodeChildren = []
        if (__init__ !== null) {
          nodeChildren.push(new PyHierarchyNode('__init__', false, os.path.join(path, __init__)))
        }
        for (const fpChild of fpChildren) {
          nodeChildren.push(await _treeResolve(fpChild, root))
        }
        return new PyHierarchyNode(pkgname, true, path, nodeChildren)
      }
    }

    const _pick__init__ = (arr: string[]): (string | null) => {
      const PYI = '__init__.pyi'
      const PY = '__init__.py'
      if (arr.includes(PYI)) {
        return PYI
      }
      else if (arr.includes(PY)) {
        return PY
      }
      else {
        return null
      }
    }
  
    export const treeResolve = async (path: string): Promise<PyHierarchyNode> => {
      return await _treeResolve(path, path)
    }
  }
  
  export namespace inner {
    export type PyExports = {
      funcs: {
        name: string
        ast: pythonAst.FunctionDef
      }[]
      classes: {
        name: string
        ast: pythonAst.ClassDef
      }[]
      vars: {
        name: string
        ast: (pythonAst.AnnAssign|pythonAst.Assign)
      }[],
      reimports: {
        name: string
        ast: (pythonAst.Import|pythonAst.ImportFrom)
      }[],
    }
  
    export class PyAstModuleResolver {
  
      root: pythonAst.Module
      constructor(root: pythonAst.Module) {
        this.root = root
  
        // 335596
        // console.log(JSON.stringify(this.root).length)
      }
  
      getExports(): PyExports {
        const rootNames = pythonAst.exportChecker.getRootNames(this.root)
        // console.log('All root symbols: ', rootNames)
  
        const funcs = [] as { name: string, ast: pythonAst.FunctionDef }[]
        const classes = [] as { name: string, ast: pythonAst.ClassDef }[]
        const vars = [] as { name: string, ast: (pythonAst.AnnAssign|pythonAst.Assign) }[]
        const reimports = [] as { name: string, ast: (pythonAst.Import|pythonAst.ImportFrom) }[]
        const exportedNames = new Set<string>()
  
        for (const n of this.root.body) {
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
          console.log('root: ', this.root)
          throw new Error('getExports: partial exports')
        }
        else {
          console.log('All reference exported successfully! 😀')
        }
  
        return {
          funcs,
          classes,
          vars,
          reimports,
        }
      }
    }


    export const sortByReference = (nameAsts: { name: string, ast: pythonAst.Node }[]) : { name: string, ast: pythonAst.Node }[] => {

      return nameAsts
    }
  }

  
}

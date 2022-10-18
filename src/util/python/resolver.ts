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
    
  
    export class PyAstModuleResolver {
  
      root: pythonAst.Module
      constructor(root: pythonAst.Module) {
        this.root = root
  
        // 335596
        // console.log(JSON.stringify(this.root).length)
      }
  
      
    }
  }

  
}

import lodash from "lodash"
import { ConditionSet } from "../datastructure/condition"
import { PythonVersion } from "./common"

const TYPE_KEY_NAME = '__python_type_name'

export namespace pythonAst {

  export interface Node {
    __python_type_name: string
  }

  export interface alias extends Node {
    name: string
    asname?: string
  }

  export interface Import extends Node {
    names: alias[]
  }

  export interface ImportFrom extends Node {
    module: string
    names: alias[]
    level: number
  }

  export interface Name extends Node {
    id: string
    ctx: Node
  }

  export interface Attribute extends Node {
    value: Name
    attr: string
    ctx: Node
  }

  export interface Subscript extends Node {
    value: Name
    attr: string
    ctx: Node
  }
  
  export interface Module extends Node {
    body: Node[]
  }
  
  export interface If extends Node {
    test: Node
    body: Node[]
    orelse: Node[]
  }
  
  export interface Compare extends Node {
    comparators: any[]
    left: Node
    ops: Node[]
  }

  export interface Assign extends Node {
    targets: Node[]
    value: Node
  }

  export interface AugAssign extends Node {
    target: Node
    value: Node
    op: Node
  }

  export interface AnnAssign extends Node {
    target: Name | Attribute | Subscript
    annotation: Name | Constant
    value?: Node
    simple: boolean
  }
  
  

  export interface List extends Node {
    elts: Node[]
    ctx: Node
  }

  export interface Constant extends Node {
    value: any
  }

  export interface arg extends Node {
    arg: string
    annotation: Name | Constant
  }

  export interface arguments extends Node {
    posonlyargs: arg[]
    args: arg[]
    vararg: arg
    kwonlyargs: arg[]
    kw_defaults: (Node | null)[]
    kwarg: arg
    defaults: (Node | null)[]
  }

  export interface Return extends Node {
    value: Node
  }

  export interface FunctionDef extends Node {
    name: string
    args: arguments
    body: Node[]
    decorator_list: Node[]
    returns: Return
  }

  export interface AsyncFunctionDef extends FunctionDef {
    // An async def function definition. Has the same fields as FunctionDef.
  }

  export interface ClassDef extends Node {
    name: string
    bases: Node[]
    keywords: Node[]
    starargs: Node
    kwargs: Node
    body: Node[]
    decorator_list: Node[]
  }


  export namespace environmentVerify {
    export const isCompareVersion = ConditionSet.makeTest<pythonAst.Node>(cs => {
      cs.assert((n: Node) => n.__python_type_name == 'Compare')
      cs.changeTarget(n => n.left)
      cs.assert((n: Node) => n.__python_type_name == 'Attribute')
      cs.targetAssert(
        (n: Attribute) => n.attr,
        (attr: string) => attr == 'version_info'
      )
      cs.targetAssert(
        (n: Attribute) => n.value,
        (value: Name) => value.id == 'sys'
      )
    })
  
    export const isComparePlatform = ConditionSet.makeTest<pythonAst.Node>(cs => {
      cs.assert((n: Node) => n.__python_type_name == 'Compare')
      cs.changeTarget(n => n.left)
      cs.assert((n: Node) => n.__python_type_name == 'Attribute')
      cs.targetAssert(
        (n: Attribute) => n.attr,
        (attr: string) => attr == 'platform'
      )
      cs.targetAssert(
        (n: Attribute) => n.value,
        (value: Name) => value.id == 'sys'
      )
    })
  
    export const isBothCompare = ConditionSet.makeTest<pythonAst.Node>(cs => {
      cs.assert((n: Node) => n.__python_type_name == 'BoolOp')
      cs.changeTarget(n => n.values)
      cs.assert((values: []) => values.length >= 2)
      cs.assert((values: Node[]) => {
        const a = isComparePlatform(values[0]) && isCompareVersion(values[1])
        const b = isComparePlatform(values[1]) && isCompareVersion(values[0])
        return a || b
      })
    })
  
    // is node that verify sys.verion_info / sys.platform
    export const isVerifyNode = ConditionSet.makeTest<pythonAst.Node>(cs => {
      cs.assert((n: Node) => n.__python_type_name == 'If')
      cs.changeTarget(n => n.test)
      cs.assert((test: Node) => {
        const a = isCompareVersion(test)
        const b = isComparePlatform(test)
        const c = isBothCompare(test)
        return a || b || c
      })
    })
  
    // whether local python version fit the test node
    const testVersion = (localVersion: PythonVersion, test: pythonAst.Compare): boolean => {
      // assuming: test.ops == GtE
      const opname = test.ops[0].__python_type_name
      const n = localVersion.compare(
        new PythonVersion(
          test.comparators[0].elts.map((x: any) => x.value)
        )
      )
      if (opname == 'Gt') {
        return n > 0
      }
      else if (opname == 'Lt') {
        return n < 0
      }
      else if (opname == 'GtE') {
        return n >= 0
      }
      else if (opname == 'LtE') {
        return n <= 0
      }
      else if (opname == 'Eq') {
        return n == 0
      }
      else if (opname == 'NotEq') {
        return n != 0
      }
      else {
        throw new Error(`unknow op: ${opname}`)
      }
    }
  
    // whether local python platform fit the test node
    const testPlatform = (localPlatform: string, test: any) => {
      const a = test.ops[0].__python_type_name == 'Eq' && test.comparators[0].value == localPlatform
      const b = test.ops[0].__python_type_name == 'NotEq' && test.comparators[0].value != localPlatform
      return a || b
    }
  
    const expandVerifyNode = (n: If, localPlatform: string, localVersion: PythonVersion): Node[] => {
      const test = n.test as Compare
      if(isCompareVersion(test)) {   
        if (testVersion(localVersion, test)) {
          return n.body
        }
        else {
          return n.orelse
        }
      }
      else if(isComparePlatform(test)) {
        if (testPlatform(localPlatform, test)) {
          return n.body
        }
        else {
          return n.orelse
        }
      }
      else if(isBothCompare(test)) {
        const values = (test as any).values
        const a = isComparePlatform(values[0]) && 
          testPlatform(localPlatform, values[0]) &&
          isCompareVersion(values[1]) &&
          testVersion(localVersion, values[1])
        const b = isComparePlatform(values[1]) && 
          testPlatform(localPlatform, values[1]) &&
          isCompareVersion(values[0]) &&
          testVersion(localVersion, values[0])
        if (a || b) {
          return n.body
        }
        else {
          return n.orelse
        }
      }
      else {
        console.error(n)
        throw new Error('error when expandVerifyNode')
      }
    }
  
    // modify body of node, will not work when a VJNode is passed directly
    export const recursiveExpandVerifyNodeInline = (n: Node, localPlatform: string, localVersion: PythonVersion) : void => {
      if ((n as any).body === undefined) {
        return
      }
      const body = (n as any).body as Node[]
  
      // expand
      let loopLimit = 100
      for(let i=0;i<loopLimit;i++) {

        const vjns = [] as Node[]
        for (const child of body) {
          if (isVerifyNode(child)) {
            vjns.push(child)
          }
        }

        if (vjns.length == 0) {
          break
        }

        const expanded = vjns.map(x => expandVerifyNode(x as If, localPlatform, localVersion))
        for (let i=0;i<vjns.length;i++) {
          const vjn = vjns[i]
          const j = body.indexOf(vjn)
          body.splice(j, 1, ...expanded[i])
        }

        // limit
        if (i == loopLimit - 1) {
          throw new Error('recursiveExpandVerifyNodeInline loop limit reached')
        }
      }
      
  
      // expand all child
      for (const child of body) {
        recursiveExpandVerifyNodeInline(child, localPlatform, localVersion)
      }
    }
  }


  export namespace exportChecker {

    const isAssign__all__ = ConditionSet.makeTest(cs => {
      cs.assert((n: Node) => n.__python_type_name == 'Assign')
      cs.changeTarget((n: Assign) => n.targets[0])
      cs.assert((n: Name) => n.id == '__all__')
    })

    const get__all__FromAssign = (n: Assign): string[] => {
      const value = n.value as List
      return (value.elts as Constant[]).map(x => x.value)
    }

    const isAugAssign__all__ = ConditionSet.makeTest(cs => {
      cs.assert((n: Node) => n.__python_type_name == 'AugAssign')
      cs.changeTarget((n: AugAssign) => n.target)
      cs.assert((n: Name) => n.id == '__all__')
    })

    const get__all__FromAugAssign = (n: AugAssign): string[] => {
      const value = n.value as List
      return (value.elts as Constant[]).map(x => x.value)
    }

    export const getRootNames = (m: Module): string[] => {

      const assignNodes: Assign[] = m.body.filter(isAssign__all__) as Assign[]
      const augAssignNodes: AugAssign[] = m.body.filter(isAugAssign__all__) as AugAssign[]

      // try to use __all__
      if (assignNodes.length || augAssignNodes.length) {
        let res = [] as string[]
        for (const n of m.body) {
          if (isAssign__all__(n)) {
            res = res.concat(get__all__FromAssign(n as Assign))
          }
          else if (isAugAssign__all__(n)) {
            res = res.concat(get__all__FromAugAssign(n as AugAssign))
          }
        }

        // forbid re-import & builtin
        let shallowRootNodes = m.body.filter(x => {
          return (
            assignNodes.indexOf(x as Assign) < 0 && 
            augAssignNodes.indexOf(x as AugAssign) < 0
          )
        })
        shallowRootNodes = lodash.cloneDeep(shallowRootNodes)
        for (const node of shallowRootNodes) {
          if ((node as any).body !== undefined) {
            (node as any).body = []
          }
        }
        const str = JSON.stringify(shallowRootNodes)

        const wholeWordMatched = (word: string, text: string): boolean => {
          const reg = new RegExp(`[^0-9a-zA-Z_]${word}[^0-9a-zA-Z_]`)
          return text.match(reg) != null
        }
        
        res = res.filter(name => {
          const found = wholeWordMatched(name, str)
          if (!found) {
            console.warn(`name "${name}" was not found in whole module, suck!`)
          }
          return found
        })
        return res
      }
      
      // export all root functions & classes when failed
      else {
        let res = [] as string[]
        for (const n of m.body) {
          if (n.__python_type_name == 'FunctionDef' || n.__python_type_name == 'ClassDef') {
            res.push((n as (FunctionDef | ClassDef)).name)
          }
        }
        res = Array.from(new Set(res))
        return res
      }
    }

    
  }
  
}


// /**
//  * tce - test, cast, execute
//  * @param node 
//  * @param name 
//  * @param cb 
//  * @returns 
//  */
//  function tce<T extends PyAstNode>(node: PyAstNode, name: string, cb: (n: T) => boolean): boolean {
//   if (node.__python_type_name != name) {
//     return false
//   }
//   return cb(node as T)
// }
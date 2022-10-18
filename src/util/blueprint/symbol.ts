import { pythonAst } from "../python/ast"
import { BPN, BPNType } from "./node"
import { BPS, BPSType } from "./slot"

export namespace symbol {
  
  export enum FlatSymbolType {
    BP_CONSTANT,
    BP_FUNCTION,
    BP_CLASS,

    PY_CONSTANT,
    PY_FUNCTION,
    PY_CLASS
  }

  export type FlatSymbol = {
    name: string,
    from: string,
    type: FlatSymbolType,
    desc: string  // description

    // python only
    pyAst?: pythonAst.Node

    // old, unused
    // varType?: string,
    // functionSignature?: FunctionSignature[]
  }

  export const search = (kw: string, src: FlatSymbol[]): FlatSymbol[] => {
    if (kw === '') {
      return src
    }

    let match: FlatSymbol[]
    if (kw.indexOf('.')>=0) {
      const arr = kw.split('.')
      const srFrom = arr[0]
      const srName = arr[1]
      match = src.filter(x => {
        return x.name.startsWith(srName) && x.from.includes(srFrom)
      })
    }
    else {
      match = src.filter(x => x.name.startsWith(kw))
    }
    
    match.sort((a, b) => {
      return a.name.localeCompare(b.name)
    })
    return match
  }

  export const isConst = (s: FlatSymbol): boolean => {
    return s.type == FlatSymbolType.BP_CONSTANT || s.type == FlatSymbolType.PY_CONSTANT
  }

  export const isFunction = (s: FlatSymbol): boolean => {
    return s.type == FlatSymbolType.BP_FUNCTION || s.type == FlatSymbolType.PY_FUNCTION
  }

  export const isClass = (s: FlatSymbol): boolean => {
    return s.type == FlatSymbolType.BP_CLASS || s.type == FlatSymbolType.PY_CLASS
  }

  export const isBuiltin = (s: FlatSymbol): boolean => {
    return (
      s.type == FlatSymbolType.BP_CLASS ||
      s.type == FlatSymbolType.BP_FUNCTION ||
      s.type == FlatSymbolType.BP_CONSTANT
    )
  }

  export const isPython = (s: FlatSymbol): boolean => {
    return (
      s.type == FlatSymbolType.PY_CLASS ||
      s.type == FlatSymbolType.PY_FUNCTION ||
      s.type == FlatSymbolType.PY_CONSTANT
    )
  }

  
  export function toBPN(s: symbol.FlatSymbol): BPN {
    let name: string = s.name
    let type: BPNType
    let slots: BPS[] = []
    let remark: string = s.from

    // if (symbol.isFunction(s)) {
    //   type = BPNType.FUNCTION
    //   slots.push(new BPS(BPSType.PROCESS, '', false))
    //   slots.push(new BPS(BPSType.PROCESS, '', true))
    //   // const params = symbol.functionSignature!.map(item => {
    //   //   return new BPS(BPSType.DATA, item.param, item.param == 'return')
    //   // })
    //   // slots = slots.concat(params)
    //   remark = s.from
    // }
    if (s.type == symbol.FlatSymbolType.PY_FUNCTION) {
      type = BPNType.FUNCTION

      // process in & out
      slots.push(new BPS(BPSType.PROCESS, '', false))
      slots.push(new BPS(BPSType.PROCESS, '', true))

      // python part
      const ast = s.pyAst! as pythonAst.FunctionDef

      // normal args
      for (const arg of ast.args.args) {
        slots.push(new BPS(BPSType.DATA, arg.arg, false))
      }

      // var args
      if (ast.args.vararg) {
        slots.push(new BPS(BPSType.AUTO_LIST, ast.args.vararg.arg, false))
      }

      // optional args
      // for (const arg of ast.args.kwonlyargs) {
      //   slots.push(new BPS(BPSType.DATA, arg.arg, false))
      // }

      // return
      if(ast.returns) {
        slots.push(new BPS(BPSType.DATA, 'return', true))
      }
    }
    else {
      throw new Error("flatSymbolToBPN: 不支持的转换")
    }

    const node = new BPN(type, name, slots)
    node.remark = remark

    return node
  }
}

import { pythonAst } from "../python/ast"
import { BPN, BPNType } from "./node"
import { BPS, BPSType } from "./slot"

export enum BPSymbolType {
  BP_CONSTANT,
  BP_FUNCTION,
  BP_CLASS,

  BP_BUILTIN,
  BP_GETTER,
  BP_PURE,

  PY_CONSTANT,
  PY_FUNCTION,
  PY_CLASS
}

export class BPSymbol {
  name: string
  from: string
  type: BPSymbolType
  desc: string  // description

  // for search
  alias?: string[]

  // python only
  pyAst?: pythonAst.Node

  constructor(
    name: string,
    from: string,
    type: BPSymbolType,
    desc: string,
    pyAst?: pythonAst.Node
  ) {
    this.name = name
    this.from = from
    this.type = type
    this.desc = desc
    this.pyAst = pyAst
  }

  get nameList(): string[] {
    if (!this.alias) {
      return [ this.name ]
    }
    else {
      return [ this.name, ...this.alias ]
    }
  }

  isConst(): boolean {
    return this.type == BPSymbolType.BP_CONSTANT || this.type == BPSymbolType.PY_CONSTANT
  }

  isFunction(): boolean {
    return this.type == BPSymbolType.BP_FUNCTION || this.type == BPSymbolType.PY_FUNCTION
  }

  isClass(): boolean {
    return this.type == BPSymbolType.BP_CLASS || this.type == BPSymbolType.PY_CLASS
  }

  isBuiltin(): boolean {
    return (
      this.type == BPSymbolType.BP_CLASS ||
      this.type == BPSymbolType.BP_FUNCTION ||
      this.type == BPSymbolType.BP_CONSTANT ||
      this.type == BPSymbolType.BP_BUILTIN ||
      this.type == BPSymbolType.BP_GETTER ||
      this.type == BPSymbolType.BP_PURE
    )
  }

  isPython(): boolean {
    return (
      this.type == BPSymbolType.PY_CLASS ||
      this.type == BPSymbolType.PY_FUNCTION ||
      this.type == BPSymbolType.PY_CONSTANT
    )
  }

  
  toBPN(): BPN {
    let name: string = this.name
    let type: BPNType
    let slots: BPS[] = []
    let remark: string = this.from

    if (this.type == BPSymbolType.PY_FUNCTION) {
      type = BPNType.FUNCTION

      // process in & out
      slots.push(new BPS(BPSType.PROCESS, '', false))
      slots.push(new BPS(BPSType.PROCESS, '', true))

      // python part
      const ast = this.pyAst! as pythonAst.FunctionDef

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

  static search(kw: string, src: BPSymbol[]): BPSymbol[] {

    // no kw no search
    if (kw === '') {
      return []
    }

    const joint = /[\.|\>]/
    const jointG = /[\.|\>]/g
  
    let match: BPSymbol[]
    if (kw.match(joint)) {
      const kwArr = kw.split(joint)

      const pAFrom = kwArr
      // plan A do not search name

      const pBFrom = kwArr.slice(0, kwArr.length - 1)
      const pBName = kwArr[kwArr.length - 1]

      match = src.filter(x => {
        let names: string[] //  = [x.name]
        if(x.alias) {
          names = [ x.name, ...x.alias ]
        }
        else {
          names = [ x.name ]
        }
        const from = x.from.split(joint)

        // plan A: pkg path only
        if (pAFrom.length <= from.length) {
          let flag = true
          for(let i=0; i<pAFrom.length; i++) {
            if (!from[i].includes(pAFrom[i])) {
              flag = false
              break
            }
          }
          if (flag) {
            return true
          }
        }

        // plan B: pkg path and name
        if (pBFrom.length <= from.length  && names.some(name => name.includes(pBName))) {
          let flag = true
          for(let i=0; i<pBFrom.length; i++) {
            if (!from[i].includes(pBFrom[i])) {
              flag = false
              break
            }
          }
          if (flag) {
            return true
          }
        }

        // const matchName = x.name.startsWith(srName)
        // const fromArr = x.from.split(joint)
        
        // let matchFrom = fromArr.length >= srFromArr.length // = .includes(srFrom)
        // for (let i=0; i<srFromArr.length; i++) {
        //   if (!fromArr[i].includes(srFromArr[i])) {
        //     matchFrom = false
        //     break;
        //   }
        // }
        
        // return matchName && matchFrom
      })
    }
    else {
      match = src.filter(x => x.nameList.some(name => `${x.from.replaceAll(jointG, '')}${name}`.includes(kw)))
    }
    
    match.sort((a, b) => {
      return a.name.localeCompare(b.name)
    })
    return match
  }
}


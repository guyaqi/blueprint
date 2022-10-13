import { BPN, BPNType } from "./node";
import { BPS, BPSType } from "./slot";

/**
 * 
 * Python导入的数据注解
 * 
 */

export type PkgTreeNode = {
  name: string,
  children: PkgTreeNode[]
}

export type SymbolNode = {
  name: string,
  function_list?: any[],
  var_list?: any[],
  class_list?: string[],
}

export type RootSymbol = {
  pkglist: {
    builtin: PkgTreeNode[],
    site: PkgTreeNode[],
  },
  root_symbols: SymbolNode[]
}


export type FunctionSignature = {
  param: string,
  type: string,
}

export enum FlatSymbolType {
  CONSTANT,
  FUNCTION,
  CLASS
}

export type FlatSymbol = {
  name: string,
  from: string,
  type: FlatSymbolType
  varType?: string,
  functionSignature?: FunctionSignature[]
}

/**
 * 
 * 到原生数据的转换
 * 
 */

export function flatSymbolToBPN(symbol: FlatSymbol): BPN {
  let name: string = symbol.name
  let type: BPNType
  let slots: BPS[] = []
  let remark: (string|undefined) = undefined

  if (symbol.type == FlatSymbolType.FUNCTION) {
    type = BPNType.FUNCTION
    slots.push(new BPS(BPSType.PROCESS, '', false))
    slots.push(new BPS(BPSType.PROCESS, '', true))
    const params = symbol.functionSignature!.map(item => {
      return new BPS(BPSType.DATA, item.param, item.param == 'return')
    })
    slots = slots.concat(params)
    remark = symbol.from
  }
  else {
    throw new Error("flatSymbolToBPN: 不支持的转换")
  }

  const node = new BPN(type, name, slots)
  node.remark = remark

  return node
  // name: string,
  // from: string,
  // type: FlatSymbolType
  // varType?: string,
  // functionSignature?: FunctionSignature[]
}
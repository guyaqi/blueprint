import { symbol } from "../util/blueprint/symbol";
import { BPN, BPNType } from "../util/blueprint/node";
import { BPS, BPSType } from "../util/blueprint/slot";

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
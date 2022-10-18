import { ref } from "vue"
import { symbol } from "../blueprint/symbol"
import { os } from "../os"

import { pythonAst } from './ast'
import { pythonExecLocal } from "./execLocal"
import { SymbolRoot } from "./symbolRoot"


class PythonBridge {

  pythonFullpath: string = ''

  symbolRoot?: SymbolRoot

  _inited: boolean = false
  _initing: boolean = false
  async init() {

    // prevents being called more than once
    if (this._inited) {
      return
    }
    if (this._initing) {
      return await new Promise<void>((res, rej) => {
        const i = setInterval(() => {
          const r = this._inited
          if (r) {
            window.clearInterval(i)
            res()
          }
        }, 50)
      })
    }
    this._initing = true

    this.pythonFullpath = await pythonExecLocal.getExecutablePath()
    if (!this.pythonFullpath) {
      throw new Error('get local python path failed')
    }
    else {
      console.log(`Use local python: ${this.pythonFullpath}`)
    }


    // try resolve all stdlib and cache
    this.symbolRoot = new SymbolRoot()
    await this.symbolRoot.resolveAll()

    // init finish
    this._inited = true
  }

  getFlats(): symbol.FlatSymbol[] {
    if (!this._inited) {
      throw new Error('accessed getFlats before init!')
    }
    const res = [] as symbol.FlatSymbol[]
    for (const exports of this.symbolRoot!.exports) {
      const pkgname = exports[0]
      const pkg = exports[1]

      for(const item of pkg.funcs) {
        if (item.ast.args.posonlyargs.length > 0) {
          console.log(item)
        }
        res.push({
          name: item.name,
          from: pkgname,
          type: symbol.FlatSymbolType.PY_FUNCTION,
          pyAst: item.ast,
          desc: this.descFromFunction(item.ast),
        })
      }

      for(const item of pkg.classes) {
        res.push({
          name: item.name,
          from: pkgname,
          type: symbol.FlatSymbolType.PY_CLASS,
          pyAst: item.ast,
          desc: this.descFromClass(item.ast),
        })
      }

      for(const item of pkg.vars) {
        res.push({
          name: item.name,
          from: pkgname,
          type: symbol.FlatSymbolType.PY_CONSTANT,
          pyAst: item.ast,
          desc: this.descFromConst(item.ast),
        })
      }
    }

    return res
  }

  descFromFunction(ast: pythonAst.FunctionDef): string {
    let res = ''
    for (const arg of ast.args.args) {
      res += `${arg.arg}, `
    }
    if (ast.args.vararg) {
      res += `*${ast.args.vararg.arg}, `
    }
    if (ast.args.kwarg) {
      res += `**${ast.args.kwarg.arg}, `
    }

    // cut tail ", "
    if (res.length >= 2) {
      res = res.slice(0, res.length-2)
    }
    return res
  }

  descFromClass(ast: pythonAst.ClassDef): string {
    return 'python class'
  }

  descFromConst(ast: pythonAst.AnnAssign | pythonAst.Assign): string {
    return 'python constant'
  }
}

export const pyBridge = ref(new PythonBridge())
export default pyBridge
import { ref } from "vue"
import { BPSymbol, BPSymbolType } from "../blueprint/symbol"
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

  getFlats(): BPSymbol[] {
    if (!this._inited) {
      throw new Error('accessed getFlats before init!')
    }
    const res = [] as BPSymbol[]
    for (const exports of this.symbolRoot!.exports) {
      const pkgname = exports[0]
      const pkg = exports[1]

      for(const item of pkg.funcs) {
        if (item.ast.args.posonlyargs.length > 0) {
          console.log(item)
        }
        res.push(new BPSymbol(
          item.name,
          pkgname,
          BPSymbolType.PY_FUNCTION,
          this.descFromFunction(item.ast),
          item.ast,
        ))
      }

      for(const item of pkg.classes) {
        res.push(new BPSymbol(
          item.name,
          pkgname,
          BPSymbolType.PY_CLASS,
          this.descFromClass(item.ast),
          item.ast,
        ))
      }

      for(const item of pkg.vars) {
        res.push(new BPSymbol(
          item.name,
          pkgname,
          BPSymbolType.PY_CONSTANT,
          this.descFromConst(item.ast),
          item.ast,
        ))
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
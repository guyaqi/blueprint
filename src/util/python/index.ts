import { ref } from "vue"
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

  async test() {
    await this.init()    
  }
}

export const pyBridge = ref(new PythonBridge())
export default pyBridge
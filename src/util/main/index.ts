import { BaseNode } from "../datastructure/tree"
import { os } from "../os"
import { TextFile } from "../os/file"
import pyBridge from "../python"

export const main = async () => {
  
  pyBridge.value.init().then(() => {
    const res = pyBridge.value.symbolRoot!.exports.get('ntpath')!.funcs.filter(x => x.name == 'join')
    // const res = pyBridge.value.symbolRoot!.exports.get('builtins')!.funcs.filter(x => x.name == 'print')
    console.log(res)
  })
}
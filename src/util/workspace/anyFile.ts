const { ipcRenderer } = require("electron")

export class AnyFile {

  path: string
  buffer: Uint8Array

  get name(): string {
    const pathArr = this.path.split(/[\\/]/).filter(x => !!x)
    return pathArr[pathArr.length - 1]
  }

  constructor(path: string, buffer: Uint8Array) {
    this.path = path
    this.buffer = buffer
  }

  isInSubDir(relRoot: string, subdir: string) {
    const relPath = this.path.slice(relRoot.length)
    const relPathArr = relPath.split(/[\\/]/).filter(x => !!x)
    
    if (relPathArr && relPathArr[0] == subdir) {
      return true
    }
    return false
  }

  save() {
    ipcRenderer.send('file-save', this.path, this.buffer)
  }
}
const { ipcRenderer } = require("electron")

export class BaseFile {

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

export class TextFile extends BaseFile {

  // text: string

  override get name(): string {
    const pathArr = this.path.split(/[\\/]/).filter(x => !!x)
    return pathArr[pathArr.length - 1]
  }

  constructor(path: string, buffer: Uint8Array) {
    super(path, buffer)
  }

  get text(): string {
    const decoder = new TextDecoder()
    return decoder.decode(this.buffer)
  }

  set text(value: string) {
    const encoder = new TextEncoder()
    this.buffer = encoder.encode(value)
  }
  
  static from(af: BaseFile): TextFile {
    return new TextFile(af.path, af.buffer)
  }
}

export class BpSrcFile extends BaseFile {

  static readonly POSTFIX = '.json'

  // text: string

  override get name(): string {
    const pathArr = this.path.split(/[\\/]/).filter(x => !!x)
    return pathArr[pathArr.length - 1].slice(0, pathArr.length - BpSrcFile.POSTFIX.length)
  }

  constructor(path: string, buffer: Uint8Array) {
    super(path, buffer)
    if (!path.endsWith(BpSrcFile.POSTFIX)) {
      throw new Error(`SourceFile must has postfix: ${BpSrcFile.POSTFIX}`)
    }
    
  }

  get text(): string {
    const decoder = new TextDecoder()
    return decoder.decode(this.buffer)
  }

  set text(value: string) {
    const encoder = new TextEncoder()
    this.buffer = encoder.encode(value)
  }
  

  static from(af: BaseFile): BpSrcFile {
    return new BpSrcFile(af.path, af.buffer)
  }
}
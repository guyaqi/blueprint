import { BPCtx } from "../blueprint/context"
import { BPC, BPCI } from "../blueprint/struct"
import { os } from "../os"

const { ipcRenderer } = require("electron")

export class File {

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

  partIndexer(locator: string): any {
    throw new Error("Indexer not implemented.")
  }

  static readonly open = os.gChnlFunc<string, File>(
    'file-load',
    (path: string) => ({ path, }),
    (res: any) => new File(res.path, res.buffer)
  )
}

export class TextFile extends File {

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
  
  static from(af: File): TextFile {
    return new TextFile(af.path, af.buffer)
  }
}

export class BpSrcFile extends TextFile {

  constructor(path: string, buffer: Uint8Array) {
    super(path, buffer)

    try {
      if (this.text === '') {
        const bpc = new BPC(this.name, [], [])
        this._blueprint = new BPCI(bpc)
      }
      else {
        this._blueprint = BPCI.fromObj(JSON.parse(this.text))
      }
    }
    catch (err) {
      console.error(err)
      throw new Error('gg when BpSrcFile.ctor')
    }
  }

  private _blueprint: BPCI;
  get blueprint() { return this._blueprint }

  override partIndexer(locator: string): BPCI | BPCtx {
    if (locator == '') {
      return this.blueprint
    }

    const res = this.blueprint.contexts.find(x => x.name == 'locator')

    if (!res) {
      console.warn('contexts: ', this.blueprint.contexts)
      throw new Error(`gg when BpSrcFile.partIndexer: no context named: ${locator}`)
    }

    return res
  }

  static from(f: File): BpSrcFile {
    return new BpSrcFile(f.path, f.buffer)
  }
}
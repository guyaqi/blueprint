import { BPCtx } from "../blueprint/context"
import { BPC, BPCI } from "../blueprint/struct"
import { os } from "../os"

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

  async save() {
    // ipcRenderer.send('file-save', this.path, this.buffer)
    await BaseFile._save({ path: this.path, buffer: this.buffer })
  }

  private static readonly _save = os.gChnlFunc<{ path: string, buffer: Uint8Array }, void>(
    'file-save'
  )

  partIndexer(locator: string): any {
    return null
  }

  static readonly open = os.gChnlFunc<string, BaseFile>(
    'file-load',
    (path: string) => ({ path, }),
    (res: any) => new BaseFile(res.path, res.buffer)
  )

  isPureText(): boolean {
    try {
      const decoder = new TextDecoder()
      decoder.decode(this.buffer)
      return true
    }
    catch {
      return false
    }
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

export class BpSrcFile extends TextFile {

  constructor(path: string, buffer: Uint8Array) {
    super(path, buffer)

    try {
      if (this.text === '') {
        const name = this.name.slice(0, this.name.length-3) // cut ".bp"
        const bpc = new BPC(name, [], [])
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

    const res = this.blueprint.contexts.find(x => x.name == locator)

    if (!res) {
      console.warn('contexts: ', this.blueprint.contexts) 
      throw new Error(`gg when BpSrcFile.partIndexer: no context named: ${locator}`)
    }

    return res
  }

  static from(f: BaseFile): BpSrcFile {
    return new BpSrcFile(f.path, f.buffer)
  }

  override async save() {
    this.text = JSON.stringify(this.blueprint)
    await super.save()
  }
}
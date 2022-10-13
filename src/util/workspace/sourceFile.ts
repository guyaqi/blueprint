import { AnyFile } from "./anyFile"

// 特指蓝图源文件
export class SourceFile extends AnyFile {

  static readonly POSTFIX = '.json'

  // text: string

  override get name(): string {
    const pathArr = this.path.split(/[\\/]/).filter(x => !!x)
    return pathArr[pathArr.length - 1].slice(0, pathArr.length - SourceFile.POSTFIX.length)
  }

  constructor(path: string, buffer: Uint8Array) {
    super(path, buffer)
    if (!path.endsWith(SourceFile.POSTFIX)) {
      throw new Error(`SourceFile must has postfix: ${SourceFile.POSTFIX}`)
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
  

  static from(af: AnyFile): SourceFile {
    return new SourceFile(af.path, af.buffer)
  }
}
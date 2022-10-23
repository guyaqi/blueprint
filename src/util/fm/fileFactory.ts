
import { file } from "."
import { BpSrcFile, File } from "./file"

// 使用指定的子路径，定位至特定文件类型的某种上下文
// 返回值为any，因为无法统一不同文件的子内容类型，即使使用模板，也无法为下文增加有帮助的类型提示
// type FilePartIndexer = (url: string) => any
interface FilePartIndexer {
  partIndexer: (url: string) => any
}

// type IndexableFileFactory = (path: string) => Promise<FilePartIndexer>
type FileFactoryFunction = (path: string) => Promise<file.File>

// *单例
// 注册文件后缀名对应的文件工厂函数
export class FileFactory {
  // private _indexers = new Map<string, IndexableFileFactory>()
  private _map = new Map<string, FileFactoryFunction>()

  // registerIndexable(postfix: string, handler: IndexableFileFactory) {
  //   this._indexers.set(postfix, handler)
  // }

  // registerNormal(postfix: string, handler: FileFactoryFunction) {
  //   this._normals.set(postfix, handler)
  // }

  register(postfix: string, handler: FileFactoryFunction) {
    this._map.set(postfix, handler)
  }

  getFactory(postfix:string): FileFactoryFunction {
    let res: (FileFactoryFunction | undefined)
    res = this._map.get(postfix)
    // fallback
    if (!res) {
      res = (path) => file.File.open(path)
    }
    return res
  }

  private constructor() {
    
  }

  private static _instance?: FileFactory
  static get instance() {
    if (!FileFactory._instance) {
      FileFactory._instance = new FileFactory()
    }
    return FileFactory._instance
  }
}

// 未注册的后缀名，通过FileFactory.instance.getFactory可以返回一个fallback
// 改fallback函数将返回一个普通的File
FileFactory.instance.registerIndexable('bp', (path) => BpSrcFile.open(path))

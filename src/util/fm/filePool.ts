
/**
 * 关于文件的引用计数，由与蓝图文件的不同函数上下文来自同一文件，多次读取分开保存将发生错误，
 * 故需要一个公共的对象引用，标记文件打开，避免各自覆盖旧内容保存。
 * 在Fm模块中，只提供文件的打开，不同文件具有不同的内容分离方法，不适合为文件管理模块增加不属于
 * 模块语义的复杂度，在这里定义以下两个概念：
 * 1. 文件池：编辑器打开的文件保存于文件池中，文件池维护文件的子内容引用计数。当引用计数归零时清理内存
 * 2. FilePartIndex接口：首先文件需要派生自fm.File来实现基础读写，FPI则实现了子内容引用，定义了
 * 公用的子内容引用接口
 */

import { file, path } from "."
import { BaseFile } from "./file"
import { FileFactory } from "./fileFactory"

class FilePoolItem {
  file: BaseFile
  refer: number

  constructor(f: BaseFile) {
    this.file = f
    this.refer = 0
  }
}

// *单例
export class FilePool {
  private _pool = new Map<string, FilePoolItem>()

  private async _open(_path: string) {

    const postfix = path.postfixOf(_path)
    // console.warn(FileFactory.instance._map)
    const factory = FileFactory.instance.getFactory(postfix)
    // console.warn(FileFactory.instance._map)
    // console.log(postfix)
    // console.log(factory)
    const f = await factory(_path)
    // console.warn(f)
    // console.warn(_path)
    const item = new FilePoolItem(f)
    // console.warn(item)
    this._pool.set(_path, item)
    // console.warn(this._pool)
  }

  async acquire<T extends file.BaseFile>(path: string): Promise<T> {
    // const tryItem = this._pool.get(path)
    let item = this._pool.get(path)
    if (!item) {
      await this._open(path)
      item = this._pool.get(path)
    }
    
    if (item == undefined) {
      // console.warn(this._pool)
      throw new Error(`FilePool.acquire: _open file failed`)
    }
    item.refer += 1

    return item.file as T
  }

  weakRefer<T extends file.BaseFile>(path: string): (T|null) {
    let item = this._pool.get(path)
    if (!item) {
      return null
    }
    return item.file as T
  }

  release<T extends file.BaseFile>(f: T) {
    const item = this._pool.get(f.path)
    if (item === undefined) {
      console.error(`path no exist in file pool: ${f.path}`)
      return
    }
    item.refer -= 1
    if (item.refer <= 0) {
      this._pool.delete(f.path)
    }
  }

  private static _instance?: FilePool
  static get instance() {
    if (!FilePool._instance) {
      FilePool._instance = new FilePool()
    }
    return FilePool._instance
  }
}

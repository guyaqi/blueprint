
// export async function chooseWorkspace(): Promise<FileSystemDirectoryHandle> {
//   // open file picker
//   handle = await (window as any).showDirectoryPicker();

import { IpcRendererEvent } from "electron"
import { ref } from "vue"
import { BPCtx } from "../blueprint/context"
import { BPN } from "../blueprint/node"
import { BPC, BPCI } from "../blueprint/struct"
import { BaseTree, BaseTreeNode } from "../datastructure/tree"
import { shell } from "../shell/shell"
import { useLocalStorage } from '@vueuse/core'
import { SourceFile } from "./sourceFile"
import { AnyFile } from "./anyFile"

//   if (handle.kind === 'file') {
//     // run file code
//     // console.log()
//   } else if (handle.kind === 'directory') {
//     // run directory code
//   }
  
//   return handle
// }

// export async function hasChild(parent: FileSystemDirectoryHandle, child_name: string) {
//   for await (const item of (parent as any).entries()) {
//     if ((item as FileSystemHandle).name == child_name) {
//       return true
//     }
//   }
//   return false
// }

const { ipcRenderer } = require('electron')

export class FsTreeNode implements BaseTreeNode {
  title: string

  isDir: boolean
  path: string

  children?: BaseTreeNode[]

  constructor(title: string, isDir: boolean, path: string, children?: BaseTreeNode[]) {
    this.title = title
    this.isDir = isDir
    this.path = path
    this.children = children
  }
}

type FsLoadResult = {
  path: string
  buffer: Uint8Array
}

class Workspace {
  _path = window.localStorage.getItem('workspace-path') ? window.localStorage.getItem('workspace-path') : ''
  get path(): string {
    return this._path!
  }
  set path(value: string) {
    this._path = value
    window.localStorage.setItem('workspace-path', value)
  }
  get title(): string {
    if (!this.fileTree) {
      return ''
    }
    const arr = this.path.split(/[\\/]/)
    if (arr.length == 0) {
      return ''
    }
    return arr[arr.length - 1]
  }

  isInited: boolean = false
  fileTree: (null|BaseTree<FsTreeNode>) = null

  init() {
    if (this.isInited) {
      return
    }

    // 如果存储了路径，可以主动打开，否则只能等待手动打开
    if (this.path !== '') {
      ipcRenderer.send("workspace-load", this.path)
    }

    this.eventRegister()

    this.isInited = true
  }

  eventRegister() {
    ipcRenderer.on("workspace-load", (e: IpcRendererEvent, tree: any) => {
      this.fileTree = new BaseTree(tree)
      this.path = tree.path
    })

    ipcRenderer.on("file-load", (e: IpcRendererEvent, d: any) => {
      const res: FsLoadResult = d
      this.fileLoadHandler(new AnyFile(res.path, res.buffer))
    })
  }

  fileLoadHandler(af: AnyFile) {
    if (af.isInSubDir(this.path, 'src')) {
      this.srcFileLoadHandler(SourceFile.from(af))
    }
    else {
      console.error(`文件解析器未定义: `, af)
    }
  }

  /**
   * 
   * 蓝图源文件读写
   * 
   */
  oSF: SourceFile | null = null
  oBPCI: BPCI | null = null
  
  // 服务端返回文件处理
  srcFileLoadHandler(sf: SourceFile) {

    // already opened
    if (this.oBPCI && this.oBPCI.config.name == sf.name) {
      return
    }
    
    if (sf.text === '') {
      const bpc = new BPC(sf.name, [], [])

      this.oSF = sf
      this.oBPCI = new BPCI(bpc)
    }
    else {
      this.oSF = sf
      this.oBPCI = BPCI.fromObj(JSON.parse(sf.text))
    }
  }

  // 渲染端想打开某个文件
  async openSrc(_path: string) {
    const buf = ipcRenderer.send('file-load', _path)
  }

  // 渲染端想保存某个文件
  async saveSrc() {
    console.log('=== save bpc');
    console.log(this.oBPCI);

    const s = JSON.stringify(this.oBPCI)
    // console.log(s);

    if (this.oSF == null) {
      return
    }

    this.oSF.text = s
    this.oSF.save()
    // const writableStream = await (this._bpcfh as any).createWritable();
    // await writableStream.write(s);
    // await writableStream.close();
  }


  /**
   * 
   * 上下文相关
   * 
   */

  // 打开的上下文
  private _octx: (null|BPCtx) = null
  get oCtx(): (null|BPCtx) {
    return this._octx
  }

  // 在某个蓝图类实例上，打开某个上下文
  async openCtx(node: BPN) {
    if (!this.oBPCI) {
      shell.error('no bpci opened', 'openCtx')
      return
    }
    if (this.oBPCI.config.functions.indexOf(node) < 0) {
      shell.error('上下文打开失败, 选定的节点不是蓝图的子项', 'openCtx')
    }

    // already opened
    if (this._octx && this._octx.name == node.name) {
      return
    }

    // 查询保存的上下文
    let exist = false
    for (const ctx of this.oBPCI?.contexts!) {
      if (ctx.name == node.name) {
        this._octx = ctx
        shell.debug('载入上下文')
        exist = true
        break
      }
    }
    if (!exist) {
      shell.debug('创建新的上下文')
      this._octx = BPCtx.fromFunction(node)
      this.oBPCI!.contexts.push(this._octx)
    }
  }
}

export const workspace = ref(new Workspace())
export default workspace
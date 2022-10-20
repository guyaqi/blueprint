
// export async function chooseWorkspace(): Promise<FileSystemDirectoryHandle> {
//   // open file picker
//   handle = await (window as any).showDirectoryPicker();

import { IpcRendererEvent } from "electron"
import { ref } from "vue"
import { Tree, BaseNode } from "./datastructure/tree"

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

export class FsTreeNode implements BaseNode {
  title: string

  isDir: boolean
  path: string

  children?: BaseNode[]

  constructor(title: string, isDir: boolean, path: string, children?: BaseNode[]) {
    this.title = title
    this.isDir = isDir
    this.path = path
    this.children = children
  }
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

  // focusPath?: string

  isInited: boolean = false
  fileTree: (null|Tree<FsTreeNode>) = null

  init() {
    if (this.isInited) {
      return
    }

    // 如果存储了路径，可以主动打开，否则只能等待手动打开
    this.reload()

    this.eventRegister()

    this.isInited = true
  }

  reload() {
    if (this.path !== '') {
      ipcRenderer.send("workspace-load", 0, { path: this.path })
    }
  }

  eventRegister() {
    const defaultSort = (tree: FsTreeNode) => {
      if (tree.children) {
        tree.children.sort((a, b) => {
          if (a.children!==undefined && b.children===undefined) {
            return -1
          }
          else if (a.children===undefined && b.children!==undefined) {
            return 1
          }
          else {
            return a.title.localeCompare(b.title)
          }
        })
      }
    }
    ipcRenderer.on("workspace-load", (e: IpcRendererEvent, s:number, d: { tree: FsTreeNode }) => {
      defaultSort(d.tree)
      this.fileTree = new Tree(d.tree)
      this.path = d.tree.path
    })
  }

}

export const workspace = ref(new Workspace())
export default workspace
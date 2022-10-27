import { ref } from "vue"
import { BPCtx } from "./blueprint/context"
import { BPC, BPCI } from "./blueprint/struct"
import { os } from "./os"
import { BaseFile, TextFile } from "./fm/file"
import { file, path } from "./fm"
import { FileFactory } from "./fm/fileFactory"
import { FilePool } from "./fm/filePool"
import { Logger, shell } from "./logger"

/**
 * ## FileType
 * 
 * 文件的类型，用来为文件指定打开方式
 * - 通用
 *   - Unsupported: 文件类型尚不受支持
 *   - TextView: 仅限浏览的文本显示
 * - 蓝图
 *   - BpInspect:蓝图属性检视
 *   - BpCanvas: 蓝图画布编辑
 */
export enum FileType {
  Unsupported,
  TextView,
  BpInspect,
  BpCanvas,
}

/**
 * ## FileTab
 * 
 * 编辑器中一个Tab的数据实体。
 * 
 * 包含渲染属性：
 * 1. title: tab的标题，目前tab仅显示文字标题，未来再考虑拓展
 * 2. fileType: 决定tab由什么编辑器打开
 * 
 * 数据属性：
 * 1. filePath: tab使用的文件的实际路径
 * 2. innerIndex: 被使用的文件的内部索引（具体含义由被使用的文件决定）
 * 
 * 引用属性：
 * 1. file: tab使用的文件，从文件池打开
 */
export class FileTab {

  title: string
  fileType?: FileType

  uniPath: string
  filePath: string
  innerIndex: string

  file?: file.BaseFile

  static readonly SUB_FILE_SEP = '>'

  /**
   * tab的内容，其实是 `file.partIndexer(innerIndex)` 的 getter 简化
   * 
   * 由于file实际上一般是File的子类，content的类型也是由子类的函数调用返回所决定的
   */
  get content(): any {
    if (!this.file) {
      throw new Error('FileTab.content is called without open any file')
    }
    return this.file.partIndexer(this.innerIndex)
  }

  /**
   * 等价于 `this.file.save()`
   */
  async save() {
    if (this.file) {
      await this.file.save()
    }
  }
  
  /**
   * FileTab
   * @param unipath 通用路径，使用 ">" 作为分隔符，可以指定子内容索引
   */
  private constructor(uniPath: string) {
    
    // innerIndex & filePath & uniPath
    const sepIndex = uniPath.indexOf(FileTab.SUB_FILE_SEP)
    if(sepIndex < 0) {
      this.innerIndex = ''
      this.filePath = uniPath
    }
    else {
      this.innerIndex = uniPath.slice(sepIndex+1)
      this.filePath = uniPath.slice(0, sepIndex)
    }
    this.uniPath = uniPath

    // title
    const pathArr = this.filePath.split(/[\\|/]/)
    if (this.innerIndex != '') {
      this.title = `${this.innerIndex} - ${pathArr[pathArr.length-1]}`
    }
    else {
      this.title = pathArr[pathArr.length-1]
    }
  }

  static async from(unipath: string): Promise<FileTab> {
    const tab = new FileTab(unipath)
    // open file
    tab.file = await FilePool.instance.acquire(tab.filePath)

    // fileType
    const postfix = path.postfixOf(tab.title)
    if (postfix == 'bp') {
      if (tab.innerIndex) {
        tab.fileType = FileType.BpCanvas
      }
      else {
        tab.fileType = FileType.BpInspect
      }
    }
    else {
      if (tab.file.isPureText()) {
        tab.fileType = FileType.TextView
      }
      else {
        tab.fileType = FileType.Unsupported
      }
    }
    return tab 
  }
}

class Inspector {
  file?: TextFile
  blueprint?: BPCI
  path?: string

  async open(path: string) {
    if (path == this.path) {
      return false
    }
    this.path = path

    const f = await BaseFile.open(path)
    const sf = TextFile.from(f)
    
    if (sf.text === '') {
      const bpc = new BPC(sf.name, [], [])

      this.file = sf
      this.blueprint = new BPCI(bpc)
    }
    else {
      this.file = sf
      this.blueprint = BPCI.fromObj(JSON.parse(sf.text))
    }

    return true
  }

  // 在某个蓝图类实例上，打开某个上下文
  async getCtx(ctxName: string): Promise<BPCtx | undefined> {
    if (!this.blueprint) {
      return undefined
    }
    const ctx = this.blueprint.contexts.find(x => x.name == ctxName)
    if (ctx === undefined) {
      throw new Error('Inspector.getCtx: node === undefined')
    }

    return ctx
  }

  close() {
    this.file = undefined
    this.blueprint = undefined
    this.path = undefined
  }

  createCtx() {
    // if (!exist) {
    //   shell.debug('创建新的上下文')
    //   this._octx = BPCtx.fromFunction(node)
    //   this.oBPCI!.contexts.push(this._octx)
    // }
  }
}

export const inspector = ref(new Inspector())

/**
 * 编辑区域的数据总线
 */
class EditorBus {

  /**
   * 
   * All about tabs
   * 
   */

  tabs: FileTab[] = []
  tabIndex: number = -1
  // _tabIndex: number = -1
  // get tabIndex(): number {
  //   return this._tabIndex
  // }
  // set tabIndex(val: number) {
  //   if (this.tabs[val] && !this.tabs[val].isBp) {
  //     inspector.value.close()
  //   }
  //   this._tabIndex = val
  // }
  get tab(): FileTab|undefined {
    if (this.tabIndex >= 0 && this.tabIndex < this.tabs.length) {
      return this.tabs[this.tabIndex]
    }
    return undefined
  }

  findInTabs(path: string): number {
    return this.tabs.findIndex(x => x.uniPath == path)
  }

  /**
   * 
   * Open files
   * 
   */
  
  async openFile(path: string) {
    const foundIndex = this.findInTabs(path)
    if (foundIndex >= 0) {
      this.tabIndex = foundIndex
      // await this._openCurrent()
      return
    }
    else {
      const newTab = await FileTab.from(path)
      this.tabs.push(newTab)
      this.tabIndex = this.tabs.length-1

      // const isSubFile = path.includes(EditorBus.SUB_FILE_SEP)
      // console.log(path)
      // if (isSubFile) {
      //   const sepIndex = path.indexOf(EditorBus.SUB_FILE_SEP)
      //   const truePath = path.slice(0, sepIndex)
      //   const subPath = path.slice(sepIndex + 1)
      //   if (!truePath.endsWith('.bp')) {
      //     throw new Error('now only bp subpath is supported')
      //   }
      //   await inspector.value.open(truePath)
      //   const newTab: FileTab = {
      //     title: subPath,
      //     path,
      //     isBp: true,
      //   }
      //   this.tabs.push(newTab)
      //   this.tabIndex = this.tabs.length-1
      //   await this._openCurrent()
      //   return
      // }
      // else {
      //   // if open new bp, no tab is added, inspector is lauched
      //   if (path.endsWith('.bp')) {
      //     const openNew = await inspector.value.open(path)
      //     if (openNew) {
      //       this.tabIndex = -1
      //     }
      //   }
      //   // open new simple text file
      //   else {
      //     const pathArr = path.split(/[\\|/]/).filter(x => x!='')
      //     const newTab: FileTab = {
      //       title: pathArr[pathArr.length-1],
      //       path,
      //       isBp: false,
      //     }
      //     this.tabs.push(newTab)
      //     this.tabIndex = this.tabs.length-1
      //     await this._openCurrent()
      //     return
      //   }
      // }
    }
  }

  // private async _openCurrent() {
  //   // 根据isBp为当前tab添加context或者basefile
  //   const tab = this.tab
  //   if (!tab) {
  //     return
  //   }
  //   // 打开蓝图上下文时，会假设inspector已经正确切换
  //   if (tab.isBp) {
  //     if (tab.context) {
  //       return
  //     }
  //     tab.context = await inspector.value.getCtx(tab.title)
  //   }
  //   else {
  //     if (tab.file) {
  //       return
  //     }
  //     tab.file = await File.open(tab.path)
  //   }
  // }

  close(index: number) {
    const [ tabClosed ] = this.tabs.splice(index, 1)
    if (this.tabs[this.tabIndex - 1]) {
      this.tabIndex -= 1
    }
    else if (this.tabs[this.tabIndex + 1]) {
      this.tabIndex += 1
    }
    else {
      this.tabIndex = -1
    }

    shell.debug(`关闭 [${tabClosed.title}]`, 'editor.ts')
  }
  
  /**
   * 
   * 蓝图源文件读写
   * 
   */


  // 渲染端想保存某个文件
  async saveCurrent() {
    const tab = this.tab
    if (!tab || tab.fileType == FileType.Unsupported) {
      return
    }
    tab.save()
    shell.debug(`[${tab.title}] 保存成功`, 'editor.ts')
    // console.log('=== save bpc');
    // console.log(this.oBPCI);

    // const s = JSON.stringify(this.oBPCI)
    // // console.log(s);

    // if (this.oSF == null) {
    //   return
    // }

    // this.oSF.text = s
    // this.oSF.save()
  }

  closeCurrent() {
    if (!this.tab) {
      return
    }
    const i = this.tabs.indexOf(this.tab)
    if (i >= 0) {
      this.close(i)
    }
  }


  /**
  * 
  * 上下文相关
  * 
  */

  // 打开的上下文
  // private _octx: (null|BPCtx) = null
  // get oCtx(): (null|BPCtx) {
  //   return this._octx
  // }
}

export const editorBus = ref(new EditorBus())
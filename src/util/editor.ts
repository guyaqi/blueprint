import { ref } from "vue"
import { BPCtx } from "./blueprint/context"
import { BPN } from "./blueprint/node"
import { BPC, BPCI } from "./blueprint/struct"
import { shell } from "./logger"
import { os } from "./os"
import { BaseFile, TextFile } from "./os/file"
import { popup } from "./popup"
// import { workspace } from './workspace'

type FileTab = {
  title: string
  path: string

  isBp: boolean

  // isBp == true
  context?: BPCtx

  // isBp == false
  file?: BaseFile
}

class Inspector {
  file?: TextFile
  blueprint?: BPCI
  path?: string

  async open(path: string) {
    if (path == this.path) {
      return false
    }

    const f = await os.read({ path, })
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

  createCtx() {
    // if (!exist) {
    //   shell.debug('创建新的上下文')
    //   this._octx = BPCtx.fromFunction(node)
    //   this.oBPCI!.contexts.push(this._octx)
    // }
  }
}

export const inspector = ref(new Inspector())

class Editor {

  /**
   * 
   * All about tabs
   * 
   */

  tabs: FileTab[] = []
  tabIndex: number = -1
  get tab(): FileTab|undefined {
    if (this.tabIndex >= 0 && this.tabIndex < this.tabs.length) {
      return this.tabs[this.tabIndex]
    }
    return undefined
  }

  findInTabs(path: string): number {
    return this.tabs.findIndex(x => x.path == path)
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
      await this._openCurrent()
      return
    }
    else {
      const isSubFile = path.includes(':')
      if (isSubFile) {
        const sepIndex = path.indexOf(':')
        const truePath = path.slice(0, sepIndex)
        const subPath = path.slice(sepIndex + 1)
        if (!truePath.endsWith('.bp')) {
          throw new Error('now only bp subpath is supported')
        }
        await inspector.value.open(truePath)
        const newTab: FileTab = {
          title: subPath,
          path,
          isBp: true,
        }
        this.tabs.push(newTab)
        this.tabIndex = this.tabs.length-1
        await this._openCurrent()
        return
      }
      else {
        // if open new bp, no tab is added, inspector is lauched
        if (path.endsWith('.bp')) {
          const openNew = await inspector.value.open(path)
          if (openNew) {
            this.tabIndex = -1
          }
        }
        // open new simple text file
        else {
          const pathArr = path.split(/[\\|/]/).filter(x => x!='')
          const newTab: FileTab = {
            title: pathArr[pathArr.length-1],
            path,
            isBp: false,
          }
          this.tabs.push(newTab)
          this.tabIndex = this.tabs.length-1
          await this._openCurrent()
          return
        }
      }
      
      
    }
  }

  private async _openCurrent() {
    // 根据isBp为当前tab添加context或者basefile
    const tab = this.tab
    if (!tab) {
      return
    }
    // 打开蓝图上下文时，会假设inspector已经正确切换
    if (tab.isBp) {
      tab.context = await inspector.value.getCtx(tab.title)
    }
    else {
      tab.file = await os.read({ path: tab.path })
    }
  }

  
  /**
   * 
   * 蓝图源文件读写
   * 
   */
  oSF: TextFile | null = null
  oBPCI: BPCI | null = null


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
}

export const editor = ref(new Editor())
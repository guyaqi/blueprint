import { ref } from "vue"
import { BPCtx } from "./blueprint/context"
import { BPN } from "./blueprint/node"
import { BPC, BPCI } from "./blueprint/struct"
import { shell } from "./logger"
import { os } from "./os"
import { TextFile } from "./os/file"
// import { workspace } from './workspace'

class Editor {
  files: any[] = []
  current?: any
  
  openFile(path: string) {
    if(path.endsWith('.bp')) {
      this.openSrc(path)
    }
  }

  
  /**
   * 
   * 蓝图源文件读写
   * 
   */
   oSF: TextFile | null = null
   oBPCI: BPCI | null = null
 
  // 渲染端想打开某个文件
  async openSrc(_path: string) {
    // const buf = ipcRenderer.send('file-load', _path)
    const f = await os.read({ path: _path})
    console.log(f)
    const sf = TextFile.from(f)
    console.log(sf)

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

export const editor = ref(new Editor())
export default editor
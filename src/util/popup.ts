import { ref } from "vue"
import { BPN } from "./blueprint/node"

export enum PopupWindow {
  None,
  FunctionEditor,
  Alert,
  Confirm
}

export enum PopupResult {
  Cancel,
  Yes,
  No
}

export type Message = {
  msg: string,
  dietime: number,
  dying: boolean
}

export class Popup {
  drawMask: boolean = false

  // isShown: boolean = false
  windowShown: PopupWindow = PopupWindow.None

  pop(_win: PopupWindow) {

  }

  close() {
    this.drawMask = false
    this.windowShown = PopupWindow.None
  }
  
  /**
   * 
   * 函数编辑器部分
   * 
   */
  currentBPN: (BPN | null) = null
  async editFunction(node: BPN) {
    this.drawMask = true
    // this.isShown = true
    this.windowShown = PopupWindow.FunctionEditor
    this.currentBPN = node
  }

  /* alert */
  alertMsg = ''
  alertTitle? = ''
  _alertResolve?: any
  alert(msg: string, title?: string) {
    this.drawMask = true
    // this.isShown = true
    this.windowShown = PopupWindow.Alert
    this.alertMsg = msg
    this.alertTitle = title

    const that = this
    return new Promise((resolve, reject) => {
      // simple alert has no reject
      that._alertResolve = resolve
    })
  }

  /* alert */
  confirmMsg = ''
  confirmTitle? = ''
  _confirmResolve?: (value: PopupResult) => void
  confirm(msg: string, title?: string) {
    this.drawMask = true
    // this.isShown = true
    this.windowShown = PopupWindow.Confirm
    this.confirmMsg = msg
    this.confirmTitle = title

    const that = this
    return new Promise<PopupResult>((resolve, reject) => {
      // simple alert has no reject
      that._confirmResolve = resolve
    })
  }

  /* msg */
  msgList = [] as Message[]
  fadeInterval = 0
  readonly FADE_ACTION_DURATION = 250 // fade out animation duration

  /**
   * 显示消息，会自动消失
   * @param msg 要显示的消息
   * @param lifetime 消息的持续时间(秒)
   */
  message(msg: string, lifetime: number = 1) {
    const now = Date.now().valueOf()
    this.msgList.push({
      msg,
      dietime: now + lifetime * 1000,
      dying: false,
    })
    if (this.fadeInterval === 0) {
      this.fadeInterval = window.setInterval(() => {
        if (this.msgList.length === 0) {
          window.clearInterval(this.fadeInterval)
          this.fadeInterval = 0
          return
        }
    
        const nowTs = Date.now().valueOf()
        this.msgList.forEach(x => {
          if (nowTs > x.dietime) {
            x.dying = true
          }
        })
        this.msgList = this.msgList.filter(x => nowTs < x.dietime + this.FADE_ACTION_DURATION)
      }, 200)
    }
  }
  killMessage(index: number) {
    this.msgList.splice(index, 1)
  }

  // _fade() {
    
  // }
}

export const popup = ref(new Popup())
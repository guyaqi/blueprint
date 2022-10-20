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

export class Popup {
  drawMask: boolean = false

  isShown: boolean = false
  windowShown: PopupWindow = PopupWindow.None

  pop(_win: PopupWindow) {

  }

  close() {
    this.drawMask = false
    this.isShown = false
  }
  
  /**
   * 
   * 函数编辑器部分
   * 
   */
  currentBPN: (BPN | null) = null
  async editFunction(node: BPN) {
    this.drawMask = true
    this.isShown = true
    this.windowShown = PopupWindow.FunctionEditor
    this.currentBPN = node
  }

  /* alert */
  alertMsg = ''
  alertTitle? = ''
  _alertResolve?: any
  alert(msg: string, title?: string) {
    this.drawMask = true
    this.isShown = true
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
    this.isShown = true
    this.windowShown = PopupWindow.Confirm
    this.confirmMsg = msg
    this.confirmTitle = title

    const that = this
    return new Promise<PopupResult>((resolve, reject) => {
      // simple alert has no reject
      that._confirmResolve = resolve
    })
  }
}

export const popup = ref(new Popup())
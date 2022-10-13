import { ref } from "vue"
import { BPN } from "./blueprint/node"

export enum PopupWindow {
  None,
  FunctionEditor,
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
}

export const popup = ref(new Popup())
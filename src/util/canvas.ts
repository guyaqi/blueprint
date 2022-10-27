import { ref } from 'vue'
import { Point } from './blueprint/math'

class CanvasBus {
  graphMouseHold = false
  // graphMouseEvent = null as (null | MouseEvent)
  mousePosOnTransformLayer = { x: 0, y: 0 } as Point
  mousePosOnRootLayer = { x: 0, y: 0 } as Point
  canvasPosOnScreen = { x: 0, y: 0 } as Point
}

export const canvasBus = ref(new CanvasBus)
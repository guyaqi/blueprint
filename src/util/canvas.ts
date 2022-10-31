import { ref } from 'vue'
import { Point } from './blueprint/math'

class CanvasBus {
  graphMouseHold = false
  // graphMouseEvent = null as (null | MouseEvent)
  mousePosOnTransformLayer = new Point()
  mousePosOnRootLayer = new Point()

  rootLayerPos = new Point()
  transformLayerPos = new Point()
}

export const canvasBus = ref(new CanvasBus)

import { computed, onMounted, onUnmounted, ref, watch } from "vue";
// import store from "../store";
import { Point } from "./blueprint/math";
import { BPNInstance } from "./blueprint/node";
import { canvasBus } from './canvas'

// vue BPN Hook

export const useBPNH = (node: BPNInstance, isPreview: boolean = false) => {

  const holdOffset = ref(new Point())
  const holding = ref(false)
  const nodeDom = ref(null as (null | HTMLElement))
  

  const mousedown = (e: MouseEvent) => {
    holding.value = true
    canvasBus.value.graphMouseHold = true

    const nodeRect = nodeDom.value!.getBoundingClientRect()
  
    holdOffset.value.x = nodeRect.x - e.clientX
    holdOffset.value.y = nodeRect.y - e.clientY
  }

  const mousemove = (p: Point) => {
    if (holding.value) {
      node.position.x = holdOffset.value.x + p.x
      node.position.y = holdOffset.value.y + p.y
    }
  }

  const style = computed(() => ({
    left: node.position.x + 'px',
    top: node.position.y + 'px',
    position: isPreview ? 'static' : 'absolute'
  }))

  watch(computed(() => canvasBus.value.graphMouseHold), (val) => {
    if (!val) {
      holding.value = false
    }
  })
  
  watch(computed(() => canvasBus.value.mousePosOnTransformLayer), (p) => {
    mousemove(p)
  })

  return {
    nodeDom,
    style,
    // updateStyle,
    mousedown,
  }
}
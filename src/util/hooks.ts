
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import store from "../store";
import { Point } from "./blueprint/math";
import { BPNInstance } from "./blueprint/node";

// vue BPN Hook

export const useBPNH = (node: BPNInstance, isPreview: boolean = false) => {

  const holdOffset = ref(new Point())
  const holding = ref(false)
  const nodeDom = ref(null as (null | HTMLElement))
  

  const mousedown = (e: MouseEvent) => {
    holding.value = true
    store.commit('graphMouseHold', true)
  
    holdOffset.value.x = nodeDom.value!.offsetLeft - e.screenX
    holdOffset.value.y = nodeDom.value!.offsetTop - e.screenY
  }

  const mousemove = (e: MouseEvent) => {
    if (holding.value) {
      node.position.x = holdOffset.value.x + e.screenX
      node.position.y = holdOffset.value.y + e.screenY
    }
  }

  const style = computed(() => ({
    left: node.position.x + 'px',
    top: node.position.y + 'px',
    position: isPreview ? 'static' : 'absolute'
  }))

  watch(computed(() => store.state.graphMouseHold), (val) => {
    if (!val) {
      holding.value = false
    }
  })
  
  watch(computed(() => store.state.graphMouseEvent), (e) => {
    mousemove(e!)
  })

  return {
    nodeDom,
    style,
    // updateStyle,
    mousedown,
  }
}


export const useMousePosOnCanvas = () => {

  let canvasNode: (null | HTMLElement) = null
  // const canvasRect = 

  const mousePosition = ref({ x: 0, y: 0 } as Point)

  let _lastE: (MouseEvent | null) = null
  const _calcPos = (e: MouseEvent) => {
    const canvasRect = canvasNode!.getBoundingClientRect()
    // mousePosition.value.x = e.clientX - canvasRect!.x
    // mousePosition.value.y = e.clientY - canvasRect!.y
    mousePosition.value = {
      x: e.clientX - canvasRect!.x,
      y: e.clientY - canvasRect!.y
    }
    // console.log(mousePosition.value);
  }

  const mouseMoveHandler = (e: MouseEvent) => {
    _calcPos(e)
    _lastE = e
  }

  const canvasResizeHandler = () => {
    console.log('canvas resize');
    _calcPos(_lastE!)
  }
  

  onMounted(() => {
    canvasNode = document.querySelector('.graph-canvas')

    window.addEventListener('mousemove', mouseMoveHandler)
    ;(canvasNode as HTMLElement).addEventListener('resize', canvasResizeHandler)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', mouseMoveHandler);
    ;(canvasNode as HTMLElement).removeEventListener('resize', canvasResizeHandler)
  })

  return {
    mousePosition,
  }
}
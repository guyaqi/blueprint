<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
// import { context } from '../../util/blueprint/context'

import { BPNInstance, BPNType } from '../../util/blueprint/node'
import LinkLayer from './LinkLayer.vue';
import { Point, Rect } from '../../util/blueprint/math';
import ContentMenu from './ContentMenu.vue';
import { computed } from '@vue/reactivity';
import Func from '../GraphNode/Func.vue';
import ImportantProcess from '../GraphNode/ImportantProcess.vue';
import NodeWrapper from '../GraphNode/NodeWrapper.vue';
import { BPCtx } from '../../util/blueprint/context';
import { BPCI } from '../../util/blueprint/struct';
import { canvasBus } from '../../util/canvas';
import { BPSInstance } from 'src/util/blueprint/slot';
import { BPLInstance } from 'src/util/blueprint/link';
import { popup } from '../../util/popup';
import { editorBus } from 'src/util/editor';
 

const { context, root } = defineProps<{
  context: BPCtx, // 当前操作的上下文
  root: BPCI // 上下文所在的蓝图
}>()

/**
 * Dom 相关
 */
const rootEl = ref(null as (null | HTMLElement))
const transformLayerEl = ref(null as (null | HTMLElement))
const asd = ref(null)

// 计算当前点相对画布的位置
const relPosition = (e: MouseEvent, el: HTMLElement): Point => {
  if (!el) {
    return new Point()
  }
  const canvasRect = el.getBoundingClientRect()
  return new Point(
    e.clientX - canvasRect!.x,
    e.clientY - canvasRect!.y
  )
}

/**
 * 
 * 蓝图菜单相关钩子
 * 
 */
const useCanvasContextMenu = () => {
  const isMenuShown = ref(false)
  const bpMenuPosition = ref(new Point())
  const relPoint = ref(new Point())
  const bpMenuPositionStyle = computed(() => {
    return {
      top: bpMenuPosition.value.y - relPoint.value.y + 'px',
      left: bpMenuPosition.value.x - relPoint.value.x + 'px',
    }
  })
  const openMenuAt = (e: MouseEvent) => {
    console.log('open')
    isMenuShown.value = true
    relPoint.value = canvasBus.value.rootLayerPos
    bpMenuPosition.value.x = e.clientX
    bpMenuPosition.value.y = e.clientY
    // e.preventDefault()
  }
  const closeMenu = () => {
    isMenuShown.value = false
  }
  // watch(computed(() => context.nodes), (value, oldValue) => {
  //   if (!value || value.length != oldValue?.length) {
  //     isBpMenuShown.value = false
  //   }
  // }, {
  //   deep: true
  // })

  return {
    isMenuShown,
    bpMenuPositionStyle,

    openMenuAt,
    closeMenu,
  }
}
const {
  isMenuShown,
  bpMenuPositionStyle,
  openMenuAt,
  closeMenu,
} = useCanvasContextMenu()


/**
 * 平移
 */
const isRootTranslating = ref(false)
const rootTranslation = ref(new Point())
const translationStartOffset = new Point()
const applyTranform = () => {
  rootTranslation.value.x = canvasBus.value.mousePosOnRootLayer.x - translationStartOffset.x
  rootTranslation.value.y = canvasBus.value.mousePosOnRootLayer.y - translationStartOffset.y
}

/**
 * 缩放
 */
const zooms = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]
const zoomIndex = ref((zooms.length-1)/2)
const zoomIn = () => {
  if (zoomIndex.value > 0) {
    zoomIndex.value -= 1
  }
  popupZoom()
}
const zoomOut = () => {
  if (zoomIndex.value < zooms.length - 1) {
    zoomIndex.value += 1
  }
  popupZoom()
}
const popupZoom = () => {
  popup.value.message(`Zoom: ${zoom.value * 100}%`)
}
const zoom = computed(() => zooms[zoomIndex.value])

/**
 * 变换
 */
const transformStyle = computed(() => ({
  'transform':
    `translate(${rootTranslation.value.x}px, ${rootTranslation.value.y}px) ` +
    `scale(${zoom.value}, ${zoom.value})`
}))


/**
 * 节点选择
 */
// 选择框的最小大小 
const SELECT_DISPLAY_MIN = 3
// 选中的节点列表
const selected = ref([] as BPNInstance[])
// 进行选中动作
const isSelecting = ref(false)
// 选择框的样式
const selectStart = ref({ x: 0, y: 0 } as Point)
const selectBoxStyle = computed(() => {
  const p0 = selectStart.value
  const p1 = canvasBus.value.mousePosOnRootLayer
  const rect = Rect.fromPoints(p0, p1)
  
  
  
  const display = (
    isSelecting.value &&
    rect.width >= SELECT_DISPLAY_MIN &&
    rect.height >= SELECT_DISPLAY_MIN
  )

  return {
    'display': display ? 'block': 'none',
    'left': rect.x + 'px',
    'top': rect.y + 'px',
    'width': rect.width + 'px',
    'height': rect.height + 'px',
  }
})

// 计算框选的节点
const calcBoxSelect = () => {
  console.log('calcBoxSelect')

  // deselect all
  selected.value.splice(0, selected.value.length)

  // 建立选区Rect()
  const p0 = selectStart.value
  const p1 = canvasBus.value.mousePosOnRootLayer
  const selectRect = Rect.fromPoints( p0, p1 )
  // 转换到全局坐标
  selectRect.x += canvasBus.value.rootLayerPos.x
  selectRect.y += canvasBus.value.rootLayerPos.y

  // 对所有子节点进行判断
  if (!transformLayerEl.value) {
    return
  }
  const els = transformLayerEl.value.querySelectorAll('.node-wrapper')
  const elsIdInBox = [] as string[]
  els.forEach(el => {
    const rect = el.getBoundingClientRect()
    if (selectRect.collide(Rect.fromDom(rect))) {
      elsIdInBox.push(el.id)
    }
  })
  context.nodes.forEach(node => {
    if(elsIdInBox.includes(node.id)) {
      selected.value.push(node)
    }
  });
  // console.log(elsInBox)
}

// 清除选择列表
const selectedClear = () => {
  selected.value.splice(0, selected.value.length)
}

// 框选节点删除
const removeSelected = () => {
  // 先断开连接
  const targetSlots: BPSInstance[] = selected.value.flatMap(x => x.slots)
  const targetLinks: BPLInstance[] = []
  context.links.forEach(link => {
    if (targetSlots.includes(link.from) || targetSlots.includes(link.to as BPSInstance)) {
      targetLinks.push(link)
    }
  })
  targetLinks.forEach(link => {
    context.removeLink(link)
  })

  // 再移除节点
  console.log('to delete')
  console.log(selected.value)
  console.log('before')
  console.log(context.nodes)
  context.nodes = context.nodes.filter(x => {
    const s = selected.value.includes(x)
    const important = x.config.type === BPNType.IMPORTANT_PROCESS
    const save = !s || important
    console.log(x)
    console.log(save)
    return save
  })
  console.log('after')
  console.log(context.nodes)

  // 清空选择
  selected.value.splice(0, selected.value.length)
}



/**
 * 根元素事件派发
 */
const mouseDown = (e: MouseEvent) => {
  if (e.button === 0) {
    leftDown(e)
  }
  else if (e.button === 2) {
    rightDown(e)
  }

  closeMenu()
}
const leftDownPos = new Point()
const leftDown = (e: MouseEvent) => {
  isSelecting.value = true
  selectStart.value = canvasBus.value.mousePosOnRootLayer

  leftDownPos.x = e.clientX
  leftDownPos.y = e.clientY
}
const rightDownPos = new Point()
const rightDown = (e: MouseEvent) => {
  if (!transformLayerEl.value) {
    return
  }
  isRootTranslating.value = true
  const transLayerRect = transformLayerEl.value.getBoundingClientRect()
  translationStartOffset.x = e.clientX - transLayerRect.x
  translationStartOffset.y = e.clientY - transLayerRect.y
  rightDownPos.x = e.clientX
  rightDownPos.y = e.clientY
}
const mouseMove = (e: MouseEvent) => {
  if (transformLayerEl.value) {
    canvasBus.value.mousePosOnTransformLayer = relPosition(e, transformLayerEl.value)
  }
  if (rootEl.value) {
    canvasBus.value.mousePosOnRootLayer = relPosition(e, rootEl.value)
  }

  if (isRootTranslating.value) {
    applyTranform()
  }
}
const globalMouseUp = (e: MouseEvent) => {
  if (e.button === 0) {
    leftUp(e)
  }
  else if (e.button === 2) {
    rightUp(e)
  }
}
const leftUp = (e: MouseEvent) => {

  // 结束选择状态
  isSelecting.value = false
  
  const endPoint = new Point(e.clientX, e.clientY)
  if (
    Math.abs(leftDownPos.x - endPoint.x) < SELECT_DISPLAY_MIN ||
    Math.abs(leftDownPos.y - endPoint.y) < SELECT_DISPLAY_MIN
  ) {
    // 左键单击空白
    selectedClear()
  }
  // 拖动，计算被选节点
  else {
    calcBoxSelect()
  }
}
const rightUp = (e: MouseEvent) => {
  isRootTranslating.value = false

  const endPoint = new Point(e.clientX, e.clientY)
  if (rightDownPos.distance(endPoint) <= 1) {
    openMenuAt(e)
  }
}
const keyDown = (e: KeyboardEvent) => {
  // console.log(e.key)
  // 避免响应子元素输入框操作
  if (
    e.target == rootEl.value &&
    e.key == 'Delete'
  ) {
    removeSelected()
  }
}
const wheel = (e: WheelEvent) => {
  if (e.deltaY > 0) {
    zoomIn()
  }
  else if (e.deltaY < 0) {
    zoomOut()
  }
  // do not zoom when e.deltaY == 0,
  // that means zoom on another axis
}
/**
 * 节点事件
 */
// const nodeClick = (e: MouseEvent, n: BPNInstance) => {
//   selected.value.splice(0, selected.value.length)
//   selected.value.push(n)
//   e.stopPropagation()
// }

const nodeMouseDownPos = new Point()
const nodeMouseDown = (e: MouseEvent, n: BPNInstance) => {
  // selected.value.splice(0, selected.value.length)
  // selected.value.push(n)
  // e.stopPropagation()
  nodeMouseDownPos.x = canvasBus.value.mousePosOnTransformLayer.x
  nodeMouseDownPos.y = canvasBus.value.mousePosOnTransformLayer.y

  // 对节点按下左键时，如果当前节点没有被选中，则取消所有选择
  if (!selected.value.includes(n)) {
    selectedClear()
  }
}
const nodeMouseUp = (e: MouseEvent, n: BPNInstance) => {

  // 不管是单击还是拖动都要向节点重新派发松开鼠标的事件
  // 该事件由每个节点处理，通过画布上下文:递
  if (canvasBus.value.graphMouseHold) {
    canvasBus.value.graphMouseHold = false
  }
  
  
  const endPoint = canvasBus.value.mousePosOnTransformLayer
  // 单击: 选中当前节点
  if (nodeMouseDownPos.distance(endPoint) <= 1) {
    selected.value.push(n)
  }
  // 移动节点
  else {
    
  }
  
  
  e.stopPropagation()
}
// 自身位置观察
const calcSelfPos = () => {
  if (!transformLayerEl.value || !rootEl.value) {
    console.warn('calc canvas position failed, element has not been mounted')
    return
  }
  const rect = rootEl.value.getBoundingClientRect()
  canvasBus.value.rootLayerPos = new Point(rect.x, rect.y)

  const rect2 = transformLayerEl.value.getBoundingClientRect()
  canvasBus.value.transformLayerPos = new Point(rect2.x, rect2.y)
}
// 挂载后添加位置监视
onMounted(() => {
  const observer = new MutationObserver((mutationsList: any, observer: any) => { calcSelfPos() });
  observer.observe(transformLayerEl.value as Node, { attributes: true });

  const observer2 = new MutationObserver((mutationsList: any, observer: any) => { calcSelfPos() });
  observer2.observe(rootEl.value as Node, { attributes: true });

  calcSelfPos()

  window.addEventListener('mouseup', globalMouseUp)
})
onUnmounted(() => {
  window.removeEventListener('mouseup', globalMouseUp)
})
</script>
  
<template>
  <div class="graph-canvas" tabindex="0" ref="rootEl"
    @mousemove="mouseMove" @mousedown="mouseDown" @wheel="wheel" @keydown="keyDown">
    <div class="no-open-things" v-if="!context">Open a function to design.</div>

    <div class="overflow-mask">
      <div class="transform-layer" :style="transformStyle" ref="transformLayerEl">
        <NodeWrapper v-if="context" v-for="node in context.nodes"
        @mousedown="e => nodeMouseDown(e, node)"
        @mouseup="e => nodeMouseUp(e, node)"
        :inst="node" :activate="selected.includes(node)" />

        <LinkLayer class="link-layer-z" :context="context" />
        
      </div>
    </div>

    <ContentMenu v-show="isMenuShown" :style="bpMenuPositionStyle" @close="isMenuShown=false" />
    <div v-if="isSelecting" class="select-box" :style="selectBoxStyle"></div>
    
  </div>
</template>
  
<style scoped lang="scss">
.graph-canvas {
  background-image: url('../../assets/images/Grid.svg');
  width: 100%;
  height: 100%;
  position: relative;
  outline: none;
  
}

.no-open-things {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 3;

  display: flex;
  align-items: center;
  justify-content: center;

  // background-color: #2e2f32;
  font-size: 24px;
  cursor: not-allowed;
}

.select-box {
  position: absolute;
  z-index: 10;
  top: 0;
  left: 0;
  width: 100px;
  height: 100px;
  border: 1px solid #fffa;
  background-color: #fff4;
  user-select: none;
}
.link-layer-z {
  z-index: 1;
}

.overflow-mask {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.transform-layer {
  width: 100%;
  height: 100%;
}
</style>
  
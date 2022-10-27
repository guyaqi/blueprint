<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
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
    return { x: 0, y: 0 }
  }
  const canvasRect = el.getBoundingClientRect()
  return {
    x: e.clientX - canvasRect!.x,
    y: e.clientY - canvasRect!.y
  }
}

/**
 * 
 * 蓝图菜单相关钩子
 * 
 */
const useCanvasContextMenu = () => {
  const isMenuShown = ref(false)
  const bpMenuPosition = ref({ x: 0, y: 0 } as Point)
  const bpMenuPositionStyle = computed(() => {
    const relPoint = canvasBus.value.mousePosOnRootLayer
    return {
      top: bpMenuPosition.value.y - relPoint.y + 'px',
      left: bpMenuPosition.value.x - relPoint.x + 'px',
    }
  })
  const openMenuAt = (e: MouseEvent) => {
    isMenuShown.value = true
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
 * 变换
 */
const isRootTranslating = ref(false)
const rootTranslation = ref(new Point())
const translationStartOffset = new Point()
const transformStyle = computed(() => ({
  'transform': `translate(${rootTranslation.value.x}px, ${rootTranslation.value.y}px)`
}))
const applyTranform = () => {
  rootTranslation.value.x = canvasBus.value.mousePosOnRootLayer.x - translationStartOffset.x
  rootTranslation.value.y = canvasBus.value.mousePosOnRootLayer.y - translationStartOffset.y
}
// watch(() => canvasBus.value.mousePosOnTransformLayer, (val, oldValue) => {
//   if (isRootTranslating.value) {
//     rootTranslation.value.x += val.x - oldValue.x
//     rootTranslation.value.y += val.y - oldValue.y
//   }
// })

/**
 * 节点选择
 */
// 选中的节点列表
const selected = ref([] as BPNInstance[])
// 进行选中动作
const isSelecting = ref(false)
// 选择框的样式
const selectStart = ref({ x: 0, y: 0 } as Point)
const selectBoxStyle = computed(() => {
  const p0 = selectStart.value
  const p1 = canvasBus.value.mousePosOnTransformLayer
  const rect = Rect.fromPoints(p0, p1)
  
  return {
    'display': isSelecting.value ? 'block': 'none',
    'left': rect.x + 'px',
    'top': rect.y + 'px',
    'width': rect.width + 'px',
    'height': rect.height + 'px',
  }
})

// 计算框选的节点
const calcBoxSelect = () => {
  // deselect all
  selected.value.splice(0, selected.value.length)

  // 建立选区Rect()
  const p0 = selectStart.value
  const p1 = canvasBus.value.mousePosOnTransformLayer
  const selectRect = Rect.fromPoints( p0, p1 )
  // use global rect, not relate to canvasBus
  selectRect.x += canvasBus.value.canvasPosOnScreen.x
  selectRect.y += canvasBus.value.canvasPosOnScreen.y

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
const rootMouseDown = (e: MouseEvent) => {
  if (e.button === 0) {
    rootLeftDown(e)
  }
  else if (e.button === 2) {
    rootRightDown(e)
  }
}
const rootLeftDown = (e: MouseEvent) => {
  isSelecting.value = true

  selectStart.value = canvasBus.value.mousePosOnTransformLayer
}
const rootRightDown = (e: MouseEvent) => {
  if (!transformLayerEl.value) {
    return
  }
  isRootTranslating.value = true
  const transLayerRect = transformLayerEl.value.getBoundingClientRect()
  translationStartOffset.x = e.clientX - transLayerRect.x
  translationStartOffset.y = e.clientY - transLayerRect.y
}
const rootMouseMove = (e: MouseEvent) => {
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
const rootMouseUp = (e: MouseEvent) => {
  if (e.button === 0) {
    rootLeftUp(e)
  }
  else if (e.button === 2) {
    rootRightUp(e)
  }
}
const rootLeftUp = (e: MouseEvent) => {
  // 松开鼠标的时候，如果有节点被拖动，则派发释放事件
  if (canvasBus.value.graphMouseHold) {
    canvasBus.value.graphMouseHold = false
  }

  // 结束选择状态，计算被选节点
  isSelecting.value = false
  calcBoxSelect()
}
const rootRightUp = (e: MouseEvent) => {
  isRootTranslating.value = false
}
const rootDblclick = (e: MouseEvent) => {
  closeMenu()
  rootEl.value?.focus()
}
const rootContextMenu = (e: MouseEvent) => {
  openMenuAt(e)
}
const rootKeyDown = (e: KeyboardEvent) => {
  console.log(e.key)
  // 避免响应子元素输入框操作
  if (
    e.target == rootEl.value &&
    e.key == 'Delete'
  ) {
    removeSelected()
  }
}
/**
 * 节点事件
 */
const nodeClick = (e: MouseEvent, n: BPNInstance) => {
  selected.value.splice(0, selected.value.length)
  selected.value.push(n)
  e.stopPropagation()
}
// 自身位置观察
const calcSelfPos = () => {
  if (!transformLayerEl.value) {
    console.warn('calc canvas position failed, element has not been mounted')
    return
  }
  const rect = transformLayerEl.value.getBoundingClientRect()
  canvasBus.value.canvasPosOnScreen = {
    x: rect.x,
    y: rect.y
  }
}
// 挂载后添加位置监视
onMounted(() => {
  const observer = new MutationObserver((mutationsList: any, observer: any) => { calcSelfPos() });
  observer.observe(transformLayerEl.value as Node, { attributes: true });
  calcSelfPos()
})
</script>
  
<template>
  <div class="graph-canvas" tabindex="0" ref="rootEl"
    @mouseup="rootMouseUp" @mousemove="rootMouseMove" @mousedown="rootMouseDown"
    @dblclick="rootDblclick" @keydown="rootKeyDown" @contextmenu.stop="rootContextMenu">
    <div class="no-open-things" v-if="!context">Open a function to design.</div>

    <div class="overflow-mask">
      <div class="transform-layer" :style="transformStyle" ref="transformLayerEl">
        <NodeWrapper v-if="context" v-for="node in context.nodes"
        @click="e => nodeClick(e, node)"
        :inst="node" :activate="selected.includes(node)" />

        <LinkLayer class="link-layer-z" :context="context" />
        
      </div>
    </div>

    <ContentMenu v-show="isMenuShown" :style="bpMenuPositionStyle" @close="isMenuShown=false" />
    <div class="select-box" :style="selectBoxStyle"></div>
    
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
  
<script setup lang="ts">
import { ref, watch } from 'vue'
import store from '../../store';
// import { context } from '../../util/blueprint/context'

import { BPNInstance, BPNType } from '../../util/blueprint/node'
import LinkLayer from './LinkLayer.vue';
import { Point } from '../../util/blueprint/math';
import ContentMenu from './ContentMenu.vue';
import { computed } from '@vue/reactivity';
import Func from '../GraphNode/Func.vue';
import ImportantProcess from '../GraphNode/ImportantProcess.vue';
import { workspace } from '../../util/workspace';
import NodeWrapper from '../GraphNode/NodeWrapper.vue';


const mouseup = (e: MouseEvent) => {
  store.commit('graphMouseHold', false)
}

const mousemove = (e: MouseEvent) => {
  store.commit('graphMouseEvent', e)
}

/**
 * 
 * 布局相关
 * 
 */
const rootRef = ref(null as (null | HTMLElement))

/**
 * 
 * 蓝图相关
 * 
 */
const context = computed(() => workspace.value.oCtx)

/**
 * 
 * 蓝图菜单相关
 * 
 */
const isBpMenuShown = ref(false)
// const isBpMenuShown = ref(true)
const bpMenuPosition = ref({ x: 0, y: 0 } as Point)
const bpMenuStyleExtra = computed(() => {
  const rootBox = rootRef.value?.getBoundingClientRect()
  if (!rootBox) {
    return { top: 0, left: 0 }
  }
  // console.log(bpMenuPosition.value);
  // console.log(rootRef.value);
  // console.log(rootBox);
  return {
    top: bpMenuPosition.value.y - rootBox.y + 'px',
    left: bpMenuPosition.value.x - rootBox.x + 'px',
  }
})
const contextmenu = (e: MouseEvent) => {
  isBpMenuShown.value = true
  bpMenuPosition.value.x = e.clientX
  bpMenuPosition.value.y = e.clientY
  // e.preventDefault()
}
const dblclick = (e: MouseEvent) => {
  isBpMenuShown.value = false
}
watch(computed(() => context.value?.nodes), (value, oldValue) => {
  if (!value || value.length != oldValue?.length) {
    isBpMenuShown.value = false
  }
}, {
  deep: true
})

const nodes = computed(() => context.value?.nodes)

</script>
  
<template>
  <div class="graph-canvas" ref="rootRef" @mouseup="mouseup" @mousemove="mousemove" @contextmenu.prevent="contextmenu"
    @dblclick="dblclick">
    <div class="no-open-things" v-if="!context">Open a function to design.</div>
  
    <NodeWrapper v-if="context" v-for="node in context.nodes" :inst="node"  />

    <LinkLayer class="link-layer-z" />
    <ContentMenu v-show="isBpMenuShown" :style="bpMenuStyleExtra" @close="isBpMenuShown=false" />
  </div>
</template>
  
<style scoped lang="scss">
.graph-canvas {
  background-image: url('../../assets/images/Grid.svg');
  width: 100%;
  height: calc(100% - 32px);
  position: relative;

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
}

// .node-layer {
//   width: 100%;
//   height: 100%;
  
//   position: absolute;
//   top: 0;
//   left: 0;
// }

.link-layer-z {
  z-index: 1;
}

</style>
  
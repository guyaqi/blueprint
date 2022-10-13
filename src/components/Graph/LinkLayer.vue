<script setup lang="ts">
import { computed } from '@vue/reactivity';
import { workspace } from '../../util/workspace';
import { onMounted, ref, watch } from 'vue'
import store from '../../store';
import { useMousePosOnCanvas } from '../../util/hooks'

const context = computed(() => workspace.value.oCtx)
const paths = computed(() => context.value?.links.map(x => x.pathString))

/**
 * 
 * 鼠标位置追踪
 * 
 */
const { mousePosition } = useMousePosOnCanvas()
watch(mousePosition, val => {
  if (context.value?.pendingLink) {
    context.value.pendingLink.to = val
  }
})
watch(computed(() => context.value?.pendingLink), val => {
  if (val) {
    context.value!.pendingLink!.to = mousePosition.value
  }
})

/**
 * 
 * 移除连接
 * 
 */

const clickPath = (index: number) => {
  
  const link = context.value!.links[index]
  if (!link) {
    return
  }
  context.value?.removeLink(link)
}

const preventSelection = () => {
  document.getSelection()?.removeAllRanges()
}


</script>
  
<template>
  <svg class="link-layer" @dblclick="preventSelection">
    <path v-for="(path, index) in paths" :d="path" style="stroke: white;stroke-width:2; fill:none" @dblclick.prevent="(e) => clickPath(index)"/>
  </svg>
</template>
  
<style scoped lang="scss">
.link-layer {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
}
</style>
    
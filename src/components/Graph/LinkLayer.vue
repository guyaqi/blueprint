<script setup lang="ts">
import { computed } from '@vue/reactivity';
import { canvasBus } from '../../util/canvas';
import { onMounted, ref, watch } from 'vue'
import { BPCtx } from '../../util/blueprint/context';

const { context, } = defineProps<{
  context: BPCtx, // 当前操作的上下文
}>()


const paths = computed(() => context.links.map(x => x.pathString))

/**
 * 
 * 鼠标位置追踪
 * 
 */
watch(() => canvasBus.value.mousePosOnCanvas, val => {
  if (context.pendingLink) {
    context.pendingLink.to = val
  }
})
watch(computed(() => context.pendingLink), val => {
  if (val) {
    context.pendingLink!.to = canvasBus.value.mousePosOnCanvas
  }
})

/**
 * 
 * 移除连接
 * 
 */

const clickPath = (index: number) => {
  
  const link = context.links[index]
  if (!link) {
    return
  }
  context.removeLink(link)
}

const preventSelection = () => {
  // document.getSelection()?.removeAllRanges()
}


</script>
  
<template>
  <svg class="link-layer" @dblclick="preventSelection">
    <path v-for="(path, index) in paths"
      :d="path" style="stroke: white;stroke-width:2; fill:none" @dblclick.prevent="(e) => clickPath(index)"/>
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
    
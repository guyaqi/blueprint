<script setup lang="ts">
import { BPCtx } from '../../util/blueprint/context';
import { BPCI } from '../../util/blueprint/struct';
import { onMounted, onUnmounted, Ref, ref } from 'vue'
import { FileTab } from '../../util/editor'
import { FilePool } from '../../util/fm/filePool';
import { BpSrcFile } from '../../util/fm/file';
import { computed, ComputedRef } from '@vue/reactivity';
import Inspector from './Inspector.vue';
import Graph from '../Graph/Graph.vue';

const pp = defineProps<{ tab: FileTab }>()
const context = pp.tab.content as BPCtx

const root: Ref<BPCI|null> = ref(null)

// 上下文的tab中不包含对蓝图根节点引用，需要自行引用
onMounted(() => {
  const srcFile = FilePool.instance.weakRefer<BpSrcFile>(pp.tab.filePath)
  if (!srcFile) {
    throw new Error(`BlueprintCanvas.onMounted: get weakRefer failed`)
  }
  root.value = srcFile.blueprint
})

</script>
  
<template>
  <div class="bp-canvas" v-if="root">
    <Inspector :blueprint="root" :root-path="pp.tab.filePath" :context="context" />
    <Graph :context="tab.content" :root="root" />
  </div>
</template>
  
<style scoped lang="scss">
.bp-canvas {
  flex-grow: 1;
  height: 100%;

  display: flex;
}
</style>
  
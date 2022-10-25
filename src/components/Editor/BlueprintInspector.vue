<script setup lang="ts">
import { BPCI } from 'src/util/blueprint/struct';
import { ref } from 'vue'
import { FileTab } from '../../util/editor'
import Inspector from './Inspector.vue'

const pp = defineProps<{ tab: FileTab }>()
const bpci = pp.tab.content as BPCI

console.log(bpci)
</script>
  
<template>
  <div class="bp-canvas">
    <Inspector :root-path="pp.tab.filePath" :blueprint="pp.tab.content" />
    <div class="empty-canvas">
      {{ bpci.config.name }}
    </div>
  </div>
</template>
  
<style scoped lang="scss">
.bp-canvas {
  flex-grow: 1;
  height: 100%;

  display: flex;
}
.empty-canvas {
  flex: 1;
  background-image: url(../../assets/images/Grid.svg);
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;

  padding: 2rem;
  font-size: 5rem;
  line-height: 5rem;
  color: #fff3;
}
</style>
  
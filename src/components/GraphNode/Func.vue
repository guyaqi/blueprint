<script setup lang="ts">
import { BPNInstance } from '../../util/blueprint/node';
import { useBPNH } from '../../util/hooks';
import BSlot from '../Graph/BSlot.vue';

const { instance, preview } = defineProps<{ instance: BPNInstance, preview?: boolean }>()

const { config, position } = instance
const isPreview = !!preview

const {
  style,
  mousedown,
  nodeDom,
} = useBPNH(instance, isPreview)

</script>
  
<template>
  <div class="bp-node" ref="nodeDom" :style="(style as any)" @mousedown="mousedown">
    <div class="func-head">
      <div class="name">{{ config.name }}</div>
      <!-- <div>{{ instance.slots.length }}</div> -->
      <div v-if="config.remark" class="remark">{{ config.remark }}</div>
    </div>

    <div class="main">
      <div class="col">
        <BSlot v-for="si in instance.inslots" :instance="si" />
      </div>

      <div class="col p-3"></div>

      <div class="col outSlot-list">
        <BSlot v-for="si in instance.outslots" :instance="si" />
      </div>
    </div>
  </div>
</template>
  
<style scoped lang="scss">

.func-head {
  background-image: radial-gradient(farthest-corner at 0 0, #0085ff 0%, #333 100%);
  width: 100%;
  height: fit-content;
  line-height: 32px;
  // display: flex;
  // align-items: center;
  white-space: pre;
  padding: 4px 8px;
}
</style>
    
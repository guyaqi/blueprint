<script setup lang="ts">
import { BPNInstance, BPNType } from '../../util/blueprint/node';
import { useBPNH } from '../../util/hooks';
import Func from './Func.vue';
import ImportantProcess from './ImportantProcess.vue';

const { inst, preview } = defineProps<{ inst: BPNInstance, preview?: boolean }>()

const { config, position } = inst
const isPreview = !!preview

const {
  style,
  mousedown,
  nodeDom,
} = useBPNH(inst, isPreview)

const type = inst.config.type

// nodes: BPNInstance[] = []

// get functionNodes(): Readonly<BPNInstance[]> {
//   return this.nodes.filter(x => x.config.type == BPNType.FUNCTION)
// }

// get importantProcessNodes(): Readonly<BPNInstance[]> {
//   return this.nodes.filter(x => x.config.type == BPNType.IMPORTANT_PROCESS)
// }

</script>
  
<template>
  <Func v-if="type == BPNType.FUNCTION" :instance="inst" />
  <ImportantProcess v-else-if="type == BPNType.IMPORTANT_PROCESS" :instance="inst" />
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
    
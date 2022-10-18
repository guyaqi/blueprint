<script setup lang="ts">
import { BPNInstance, BPNType } from '../../util/blueprint/node';
import { useBPNH } from '../../util/hooks';
import Func from './Func.vue';
import ImportantProcess from './ImportantProcess.vue';
import Builtin from './Builtin.vue';

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
  <Builtin v-if="type == BPNType.BUILTIN" :instance="inst" />
</template>
  
<style scoped lang="scss">

</style>
    
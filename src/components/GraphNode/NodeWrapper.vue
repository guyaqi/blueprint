<script setup lang="ts">
import { BPNInstance, BPNType } from '../../util/blueprint/node';
import { useBPNH } from '../../util/hooks';
import Func from './Func.vue';
import ImportantProcess from './ImportantProcess.vue';
import Builtin from './Builtin.vue';

const {
  inst,
  preview,
  activate
} = defineProps<{
  inst: BPNInstance,
  preview?: boolean,
  activate: boolean
}>()

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
  <div class="node-wrapper" ref="nodeDom"
    :class="{'activate': activate}" :style="(style as any)" :id="inst.id"
    @mousedown.stop="mousedown">
    <Func v-if="type == BPNType.FUNCTION" :instance="inst" />
    <ImportantProcess v-else-if="type == BPNType.IMPORTANT_PROCESS" :instance="inst" />
    <Builtin v-if="type == BPNType.BUILTIN" :instance="inst" />
  </div>
  
</template>
  
<style scoped lang="scss">
.node-wrapper {
  position: absolute;
  z-index: 2;
  border: 2px solid transparent;
}
.activate {
  border: 2px solid rgb(255 255 255 / 75%);
  border-radius: 0.5rem;
  box-shadow: 0 0 2rem rgb(255 255 255 / 25%);
}
</style>
    
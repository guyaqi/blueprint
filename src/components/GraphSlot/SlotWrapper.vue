<script setup lang="ts">
import { BPSType, BPSInstance } from '../../util/blueprint/slot';
import BaseSlot from './BaseSlot.vue';
import AutoList from './AutoList.vue';

const { instance, } = defineProps<{ instance: BPSInstance }>()

const config = instance.config

const isProcessOrData = (
  config.type == BPSType.PROCESS ||
  config.type == BPSType.DATA ||
  config.type == BPSType.LITERIAL
)
const isAutoList = config.type == BPSType.AUTO_LIST

</script>
  
<template>
  <BaseSlot v-if="isProcessOrData" :instance="instance" />
  <AutoList v-if="isAutoList" :instance="instance" />
</template>
  
<style scoped lang="scss">
.bslot {
  display: flex;
  align-items: center;
  // padding: 0 6px;
  height: 32px;
  width: fit-content;
  white-space: pre;
}

.slot-input {
  background-color: transparent;
  outline: none;
  border: 1px solid #333333;
  border-radius: 3px;
  width: 120px;
  margin: 0 8px;
  color: white;
}
</style>
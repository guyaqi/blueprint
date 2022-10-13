<script setup lang="ts">
import { ref } from 'vue'
import { BPDType } from '../../util/blueprint/data';
import { BPS } from '../../util/blueprint/slot';

const { slot, } = defineProps<{ slot: BPS }>()


const paramTypeName = [
  { type: BPDType.INT, name: 'Int' },
  { type: BPDType.FLOAT, name: 'Float' },
  { type: BPDType.STRING, name: 'String' },
  { type: BPDType.ANY, name: 'Object' },
]

</script>
  
<template>
  <select class="form-input" v-model="slot.dataType">
    <option :value="item.type" v-for="item in paramTypeName">{{ item.name }}</option>
  </select>
</template>
  
<style scoped lang="scss">

</style>
  
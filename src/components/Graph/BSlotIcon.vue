<script setup lang="ts">
import { ref } from 'vue'
import { BPSType } from '../../util/blueprint/slot';

const { slotType } = defineProps<{ slotType: BPSType }>()

const connect = true
const isProcess = slotType == BPSType.PROCESS
const isData = slotType == BPSType.DATA
</script>
  
<template>
  <div class="icon-wrapper">
    <img v-if="isProcess" class="slot-icon" src="../../assets/images/slot-process.svg">
    <div v-if="isData" class="slot-data">
      <div v-if="connect"></div>
    </div>
  </div>
</template>
  
<style scoped lang="scss">

.slot-data {
  width: 12px;
  height: 12px;
  border-radius: 12px;
  // margin: 0 1px;
  // background-color: aquamarine;
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;

  >div {
    width: 4px;
    height: 4px;
    background-color: #fff;
    border-radius: 4px;
  }
}

.icon-wrapper {
  display: flex;
  align-items: center;
  margin: 0 6px;
}

</style>
  
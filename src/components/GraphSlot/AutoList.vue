<script setup lang="ts">
import { BPSInstance } from '../../util/blueprint/slot';
import { ref } from 'vue'
import { computed } from '@vue/reactivity';
import BaseSlot from './BaseSlot.vue';

const { instance, } = defineProps<{ instance: BPSInstance }>()

const list = computed(() => instance.sub)

const clickAdd = () => {
  instance.addSub()
}
</script>
  
<template>
  <div class="auto-list">
    <BaseSlot v-for="item in list" :instance="item" />
    <div class="line-add" @click="clickAdd">
      <img class="action-add" src="../../assets/images/add.svg" alt="">
      <div>{{ instance.config.name }}</div>
    </div>
  </div>
</template>
  
<style scoped lang="scss">
.auto-list {
  display: flex;
  flex-flow: column;
}

.line-add {
  display: flex;
  align-items: center;
  height: 32px;
  user-select: none;
  cursor: pointer;
  .action-add {
    width: 14px;
    height: 14px;
    margin: 0 4px;
  }
}
</style>
  
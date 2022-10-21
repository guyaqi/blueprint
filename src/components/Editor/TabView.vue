<script setup lang="ts">
import { computed } from '@vue/reactivity';
import { editor } from '../../util/editor';
import { ref, watch } from 'vue'

const tabs = computed(() => editor.value.tabs)
const tabIndex = computed(() => editor.value.tabIndex)

const click = (index: number) => {
  // console.log(`set index: ${index}`)
  editor.value.tabIndex = index
}

const close = (index: number) => {
  editor.value.close(index)
}
</script>
  
<template>
  <div class="head-tab" v-for="(tab, index) in tabs" :class="{ 'head-tab-active': tabIndex == index }" @click="click(index)">
    <div>{{ tab.title }}</div>
    <img class="head-icon close-icon" src="../../assets/images/tips_close.svg" alt="" @click.stop="close(index)">
  </div>
</template>
  
<style scoped lang="scss">
.close-icon {
  margin-right: -8px;
  margin-left: 8px;
}
</style>
  
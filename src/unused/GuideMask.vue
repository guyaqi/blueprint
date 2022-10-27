<script setup lang="ts">
// import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
// import store from '../store';

/**
 * 
 * 连接工作区相关
 * 
 */
// const trying = ref(false)

// const connectWorkspace = async () => {
//   if (trying.value) {
//     return
//   }
//   trying.value = true

//   statusText.value = '连接中...'
//   await store.dispatch('serviceConnect')
//   if (!store.state.service) {
//     statusText.value = '连接失败, 点击重试'
//   }

//   trying.value = false
// }

// const statusText = ref('工作区未连接, 点击以连接')

// setTimeout(() => {
//   if (!store.state.service && !trying.value) {
//     store.dispatch('fakeConnect')
//     shell.debug('桩连接已启用, 无法读取/修改本地文件', 'GuideMask')
//   }
// }, 300)
</script>
  
<template>
  <!-- <div class="guide-mask" v-if="!connected" @click.stop="connectWorkspace"
    @contextmenu.prevent.stop="connectWorkspace">{{ statusText }}</div> -->
</template>
  
<style scoped lang="scss">

.guide-mask {
  width: 100%;
  height: 100%;
  z-index: 1000;
  position: absolute;
  background-color: #00000080;
  display: flex;
  align-items: center;
  justify-content: center;
  // backdrop-filter: blur(8px);
  backdrop-filter: blur(2px);
  cursor: pointer;
  user-select: none;
}
</style>
  
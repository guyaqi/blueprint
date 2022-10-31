<script setup lang="ts">
import { ref } from 'vue'
import { popup } from '../../util/popup'

// defineProps<{ msg: string }>()

// const count = ref(0)
</script>
  
<template>
  <div class="msg-root">
    <div class="msg" v-for="item in popup.msgList" :style="{'opacity' : item.dying ? 0 : 1}">{{ item.msg }}</div>
  </div>
</template>
  
<style scoped lang="scss">
.msg-root {
  position: fixed;
  right: 16px;
  top: 16px;
}

.msg {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background-color: #222;
  transition: .25s;
  margin-bottom: 0.25rem;
}
</style>
  
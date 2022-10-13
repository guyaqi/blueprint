<script setup lang="ts">
import { ref } from 'vue'

const { html, } = defineProps<{ html: string }>()

// const count = ref(0)
</script>
  
<template>
  <div class="line-content" v-html="html"></div>
</template>
  
<style scoped lang="scss">
.line-content {
  // text-indent: 1rem;
  word-break: break-all;
  white-space: pre-wrap;

  >* {
    text-indent: 0;
  }
}
</style>
  
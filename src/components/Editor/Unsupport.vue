<script setup lang="ts">
import { ref } from 'vue'

// defineProps<{ msg: string }>()

// const count = ref(0)
</script>
  
<template>
  <div class="un-rooot">
    Unsupported file format. Maybe:<br>
    1. This is a unsupported binary file<br>
    2. This is a text file not using 'utf-8' encoding
  </div>
</template>
  
<style scoped lang="scss">
.un-rooot {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
  
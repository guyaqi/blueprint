<script setup lang="ts">
import { ref } from 'vue'

// defineProps<{ msg: string }>()

// const count = ref(0)
</script>
  
<template>
  <div class="menubar">
    <div class="title">Blueprint</div>

    <div class="menu-list">
      <div class="menu-item">File(<span class="text-underline">F</span>)</div>
      <div class="menu-item">Edit(<span class="text-underline">E</span>)</div>
      <div class="menu-item">Debug(<span class="text-underline">D</span>)</div>
      <div class="menu-item">Help(<span class="text-underline">H</span>)</div>
    </div>
  </div>
</template>
  
<style scoped lang="scss">
.menubar {
  height: 30px;
  width: 100%;
  background-color: #333333;
  display: flex;
  align-items: center;
  // justify-content: center;
  padding: 0 6px;

  border-bottom: 1px solid black;
}

.text-underline {
  text-decoration: underline;
}

.title {
  font-size: 1rem;
  font-weight: bold;
}

.menu-list {
  display: flex;
  padding-left: 8px;
}

.menu-item {
  padding: 0px 8px;
  user-select: none;
  cursor: pointer;
}
</style>
    
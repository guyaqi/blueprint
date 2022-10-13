<script setup lang="ts">
import { ref } from 'vue'

// defineProps<{ msg: string }>()

// const count = ref(0)
</script>
  
<template>
  <div class="btn">
    <slot></slot>
  </div>
</template>
  
<style scoped lang="scss">
.btn {
  display: inline-block;
  font-weight: 400;
  line-height: 1.25;
  text-align: center;
  text-decoration: none;
  vertical-align: middle;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
  background-color: transparent;
  border: 1px solid transparent;
  padding: .375rem .75rem;
  // padding: 0 .375rem;
  font-size: 1rem;
  border-radius: .25rem;
  transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;

  color: inherit;
  background-color: var(--color-dark-3);

  &:hover {
    background-color: var(--color-dark-2);
  }
}
</style>
  
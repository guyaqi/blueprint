<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import store from '../../store';
import { BaseTree, BaseTreeNode } from '../../util/datastructure/tree';
import LibView from './LibView.vue';
import SrcView from './WorkspaceView.vue';

</script>
  
<template>
  <div class="sidebar">
    <SrcView />
    <LibView />
  </div>
</template>
  
<style scoped lang="scss">
.sidebar {
  height: 100%;
  width: 240px;
  flex-shrink: 0;

  border-right: 2px solid #333333;
  overflow: hidden;

  background-color: #202124;

  display: flex;
  flex-flow: column;

  // .file-item {
  //   padding-left: 6px;
  //   user-select: none;
  //   cursor: pointer;

  //   &:nth-child(2n) {
  //     background-color: #ffffff40;
  //   }
  //   &:nth-child(2n+1) {
  //     background-color: #ffffff10;
  //   }
  // }
  
}

</style>
  
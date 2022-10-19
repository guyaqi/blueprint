<script setup lang="ts">
import { BaseTree, BaseTreeNode } from '../../../util/datastructure/tree';
import { ref, StyleValue } from 'vue'
import TreeItem from './TreeItem.vue';

const props = defineProps<{
  tree: BaseTree<any>,
  styleFunc?: (n: any) => StyleValue,
  classFunc?: (n: any) => any,
  click?: (tree: BaseTree<any>) => any,
  // titleFilter?: (n: BaseTree<BaseTreeNode>) => string,
  editable?: boolean
  editCb?: (tree: BaseTree<any>, newTitle: string) => any,
  requestFinishCb?: (reqName: string, node: BaseTreeNode) => void,
}>()

</script>
  
<template>
  <div class="tree-view" tabindex="0">
    <TreeItem v-for="item in tree.children"
      :tree="item" :class-func="classFunc"  :click="click" :editable="true" :edit-cb="editCb" :requestFinishCb='requestFinishCb'/>
  </div>
</template>
  
<style scoped lang="scss">
.tree-view {
  flex-grow: 1;
  border: 1px solid transparent;
  &:focus {

    border: 1px solid dodgerblue;
    // background-color: red;
  }
}

</style>
  
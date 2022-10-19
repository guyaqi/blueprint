<script setup lang="ts">
import { ref, StyleValue } from 'vue'
import TreeItem from './TreeItem.vue';
import { Tree, BaseNode } from '../../../util/datastructure/tree';

const props = defineProps<{
  tree: Tree<any>,
  styleFunc?: (n: any) => StyleValue,
  classFunc?: (n: any) => any,
  click?: (tree: Tree<any>) => any,
  editable?: boolean
  editCb?: (tree: Tree<any>, newTitle: string) => any,
  createCb?: (from: Tree<any>, newName: string) => void,
}>()

const emits = defineEmits<{
  (event: 'clickTree', tree: Tree<BaseNode>): void,
  (event: 'dblclickTree', tree: Tree<BaseNode>): void,
  (event: 'contextmenuTree', tree: Tree<BaseNode>): void,
}>()

const clickTree = (tree: Tree<BaseNode>) => {
  emits('clickTree', tree)
}
const dblclickTree = (tree: Tree<BaseNode>) => {
  emits('dblclickTree', tree)
}
const contextmenuTree = (tree: Tree<BaseNode>) => {
  emits('contextmenuTree', tree)
}
</script>
  
<template>
  <TreeItem v-for="item in props.tree.children"
    :tree="item"
    :styleFunc="props.styleFunc"
    :classFunc="props.classFunc"
    :editable="props.editable"
    :editCb="props.editCb"
    :createCb='props.createCb'
    @clickTree="clickTree"
    @dblclickTree="dblclickTree"
    @contextmenuTree="contextmenuTree"/>
</template>
  
<style scoped lang="scss">

</style>
  
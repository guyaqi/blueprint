<script setup lang="ts">
import { ActionNode, Tree, BaseNode } from '../../../util/basic/tree';
import { ref, StyleValue } from 'vue'
import TreeItem from './TreeItem.vue';
import { computed } from '@vue/reactivity';

const props = defineProps<{
  tree: Tree<any>,

  // passed to child
  styleFunc?: (n: any) => StyleValue,
  classFunc?: (n: any) => any,
  editable?: boolean
  editCb?: (tree: Tree<any>, newTitle: string) => any,
  createCb?: (from: Tree<any>, newName: string) => void,

  // tree view only
  click?: (tree: Tree<any>) => any,
  dblclick?: (tree: Tree<any>) => any,
  onContextMenu?: (tree: Tree<BaseNode>) => ActionNode<BaseNode> | null
}>()

const treeElRef = ref(null as (null | HTMLElement))

//  tree: (BaseTree<BaseTreeNode>) => void
const menu = ref(null as (null|ActionNode<BaseNode>))

const isMenuShown = ref(false)
const menuPos = ref({
  x: 0,
  y: 0
})
const menuStyle = computed(() => ({
  left: menuPos.value.x + 'px',
  top: menuPos.value.y + 'px',
}))

const clickTree = (tree: Tree<BaseNode>) => {
  if(props.click) {
    props.click(tree)
  }
}

const dblclickTree = (tree: Tree<BaseNode>) => {
  if(props.dblclick) {
    props.dblclick(tree)
  }
}

const contentmenuTarget = ref(null as (null|Tree<BaseNode>))
const contextmenuTree = (tree: Tree<BaseNode>) => {
  menu.value = null
  if (!props.onContextMenu) {
    return
  }
  contentmenuTarget.value = tree
  menu.value = props.onContextMenu(tree)
  if (menu.value == null) {
    return
  }
}
const clickMenuItem = (node: ActionNode<BaseNode>) => {
  if (!contentmenuTarget.value) {
    return
  }
  node.action(contentmenuTarget.value)
  isMenuShown.value = false
}
const click = (e: MouseEvent) => {
  isMenuShown.value=false
  if (e.target == treeElRef.value) {
    clickTree(props.tree)
  }
}
const dblclick = (e: MouseEvent) => {
  if (e.target == treeElRef.value) {
    dblclickTree(props.tree)
  }
}
const contextMenu = (e: MouseEvent) => {

  if (e.target == treeElRef.value) {
    contextmenuTree(props.tree)
  }
  
  const treeRect = treeElRef.value!.getBoundingClientRect()
  menuPos.value.x = e.clientX - treeRect.x
  menuPos.value.y = e.clientY - treeRect.y
  if (menu.value) {
    isMenuShown.value = true
  }
}
</script>
  
<template>
  <div class="tree-view" tabindex="0" @contextmenu="contextMenu" ref="treeElRef"
    @click="click" @dblclick="dblclick">
    <TreeItem
      :asRoot="true" :tree="tree" :class-func="classFunc" :editable="true" :edit-cb="editCb"
      :create-cb='createCb' @clickTree="clickTree" @dblclickTree="dblclickTree" @contextmenuTree="contextmenuTree"/>
    <div v-if="menu" v-show="isMenuShown" class="tree-menu" @click.stop :style="menuStyle">
      <div class="tree-menu-item hover-hl" v-for="item in menu.children" @click="clickMenuItem(item)">{{ item.title }}</div>
    </div>
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
  position: relative;
}

.tree-menu {
  position: absolute;
  width: 100px;
  background-color: #333;
  border-radius: 0.25rem;
}

.tree-menu-item {
  height: 24px;
  display: flex;
  align-items: center;
  padding: 0 8px;
  user-select: none;
  cursor: pointer;
}
</style>
  
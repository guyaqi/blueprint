<script setup lang="ts">
import { ref, StyleValue } from 'vue'
import { BaseTree } from '../../util/datastructure/tree';

import { useLocalStorage } from '@vueuse/core'

// 
// interface TreeItemProp {
//   node: NodeType,
//   styleFunc: (n: any) => StyleSheetList
// }

const {
  tree,
  styleFunc,
  classFunc,
  click,
  titleFilter,
} = defineProps<{
  tree: BaseTree<any>,
  styleFunc?: (n: any) => StyleValue,
  classFunc?: (n: any) => any,
  click?: (tree: BaseTree<any>) => any,
  titleFilter?: (a: string) => string,
}>()

const isLeaf = tree.isLeaf()
// const expand = node.children && !(node.children.length === 1 && node.children[0].title === 'example')
const expand = useLocalStorage(tree.hierarchy().map(x => x.title).join('-'), false)

const _click = () => {
  if (click) {
    click(tree)
  }
  expand.value = !expand.value
}

const clickItem = () => {
  if (click) {
    click(tree)
  }
}

const extraStyle = styleFunc ? styleFunc(tree) : undefined
const extraClass = classFunc ? classFunc(tree) : undefined
</script>
  
<template>
  <div @click="_click" class="simple-list-item tree-item" :style="extraStyle" :class="extraClass">
    <div v-if="isLeaf">{{ titleFilter ?  titleFilter(tree.title) : tree.title }}</div>
    <div v-else class="node-item">
      <div v-if="!isLeaf" class="hint" :class="{'hint-expand': expand}">></div>
      <span>&nbsp;</span>
      <div>{{ tree.title }}</div>
    </div>
  </div>
  <div v-if="expand" class="sub-indent">
    <TreeItem v-for="item in tree.children" :tree="item" :styleFunc="styleFunc" :classFunc="classFunc" :click="click" :titleFilter="titleFilter" />
  </div>
</template>
  
<style scoped lang="scss">
.sub-indent {
  padding-left: 12px;
  background-color: #ffffff10;
}

.hint {
  transition: 0.25s;
}

.hint-expand {
  transform: rotate(90deg);
}

.node-item {
  display: flex;
  align-items: center;
}

.tree-item {
  cursor: pointer;
  user-select: none;
}
</style>
    
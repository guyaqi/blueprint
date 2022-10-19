<script setup lang="ts">
import { ref, StyleValue } from 'vue'
import { BaseTree, BaseTreeNode } from '../../util/datastructure/tree';

import { useLocalStorage } from '@vueuse/core'
import { computed } from '@vue/reactivity';

// 
// interface TreeItemProp {
//   node: NodeType,
//   styleFunc: (n: any) => StyleSheetList
// }

const props = defineProps<{
  tree: BaseTree<any>,
  styleFunc?: (n: any) => StyleValue,
  classFunc?: (n: any) => any,
  click?: (tree: BaseTree<any>) => any,
  // titleFilter?: (n: BaseTree<BaseTreeNode>) => string,
  editable?: boolean
  editCb?: (tree: BaseTree<any>, newTitle: string) => any,
}>()

const isLeaf = props.tree.isLeaf()
// const expand = node.children && !(node.children.length === 1 && node.children[0].title === 'example')
const expand = useLocalStorage(props.tree.hierarchy().map(x => x.title).join('-'), false)

const _click = () => {
  if (props.click) {
    props.click(props.tree)
  }
  expand.value = !expand.value
}

const extraStyle = computed(() => props.styleFunc ? props.styleFunc(props.tree) : undefined) 
const extraClass = computed(() => props.classFunc ? props.classFunc(props.tree) : undefined)

const editMode = ref(false)
const editorInput = ref(props.tree.title)
const editorRef = ref(null as (null | HTMLElement))
const editName = (e: KeyboardEvent) => {
  e.preventDefault()
  if (!props.editable) {
    return
  }
  editMode.value = true
  setTimeout(() => {
    editorRef.value?.focus()
  })
}
const editQuit = () => {
  editMode.value = false
  editorInput.value = props.tree.title
}
const editConfirm = () => {
  if (props.editCb) {
    props.editCb(props.tree, editorInput.value)
  }
  setTimeout(() => {
    editorRef.value?.blur()
  })
}
const keydown = (e: KeyboardEvent) => {
  console.log(e.key)
  if(e.key == 'Enter') {
    editConfirm()
    return
  }
  else if (e.key == 'Escape') {
    editQuit()
    return
  }
}
</script>
  
<template>
  <div @click="_click" class="simple-list-item tree-item" :style="extraStyle" :class="extraClass" tabindex="0" @keypress.enter="editName">
    <!-- <div v-if="isLeaf"></div> -->
    <div class="node-item">
      <div v-if="!isLeaf" class="hint" :class="{'hint-expand': expand}">></div>
      <span v-if="!isLeaf">&nbsp;</span>
      <input ref="editorRef" v-if="editMode" type="text"
        v-model="editorInput" class="name-edit"
        @blur="editQuit" @keydown="keydown">
      <div v-show="!editMode">{{ tree.title }}</div>
    </div>
  </div>
  <div v-if="expand" class="sub-indent">
    <div class="branch"></div>
    <TreeItem v-for="item in tree.children"
      :tree="item"
      :styleFunc="styleFunc"
      :classFunc="classFunc"
      :click="click"
      :editable="editable"
      :editCb="editCb" />
  </div>
</template>
  
<style scoped lang="scss">
.sub-indent {
  padding-left: 12px;
  // background-color: #ffffff10;
  position: relative;

  .branch {
    position: absolute;
    top: 0;
    left: 10px;
    height: 100%;
    border-left: 1px solid #fff4;
  }
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

  border: 1px solid transparent;
  &:focus {

    border: 1px solid dodgerblue;
    outline: none;
  }
}

.name-edit {
  height: 24px;
  outline: none;
  border: 1px solid dodgerblue;
  background-color: transparent;
  color: white;
}
</style>
    
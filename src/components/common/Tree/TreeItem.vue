<script setup lang="ts">
import { ref, StyleValue } from 'vue'
import { BaseTree, BaseTreeNode } from '../../../util/datastructure/tree';

import { useLocalStorage } from '@vueuse/core'
import { computed } from '@vue/reactivity';
import { FsTreeNode } from '../../../util/workspace';
import { os } from '../../../util/os';

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
  requestFinishCb?: (reqName: string, node: BaseTreeNode) => void,
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
const editorRef = ref(null as (null | HTMLInputElement))
const editName = (e: KeyboardEvent) => {

  if (!props.editable) {
    return
  }
  if (e.key != 'Enter' && e.key != 'F2') {
    return
  }

  e.preventDefault()
  
  editMode.value = true
  setTimeout(() => {
    const input = editorRef.value
    if (!input) {
      return
    }
    input.focus()
    const name = input.value
    if (!name.length) {
      return
    }
    const dotIndex = name.indexOf('.')
    if (dotIndex < 0) {
      input.select()
    }
    else {
      input.setSelectionRange(0, dotIndex)
    }
  })
}
const editNameQuit = () => {
  editMode.value = false
  editorInput.value = props.tree.title
}
const editNameConfirm = () => {
  if (props.editCb) {
    props.editCb(props.tree, editorInput.value)
  }
  setTimeout(() => {
    editorRef.value?.blur()
  })
}
const editNameKD = (e: KeyboardEvent) => {
  if(e.key == 'Enter') {
    editNameConfirm()
    return
  }
  else if (e.key == 'Escape') {
    editNameQuit()
    return
  }
}

/**
 * New File & Folder
 */

const lastRequest = ref('')
const newNameRef = ref('')
const newInputRef = ref(null as HTMLInputElement | null)
const isNewInputShow = ref(false)
const isNewFolder = ref(false)
const newInputQuit = () => {
  isNewInputShow.value = false
  newNameRef.value = ''
}
const newInputConfirm = () => {
  if (!props.requestFinishCb) {
    return
  }
  // newNameRef
  const newNode = new FsTreeNode(
    newNameRef.value,
    isNewFolder.value,
    os.path.join((props.tree.inner as FsTreeNode).path, newNameRef.value)
  )
  props.requestFinishCb(lastRequest.value, newNode)
  setTimeout(() => {
    newInputRef.value?.blur()
  })
}
const newInputKD = (e: KeyboardEvent) => {
  if(e.key == 'Enter') {
    newInputConfirm()
    return
  }
  else if (e.key == 'Escape') {
    newInputQuit()
    return
  }
}

const requestCB = (reqName: string, data: any) => {
  lastRequest.value = reqName
  isNewFolder.value = lastRequest.value.includes('folder')
  isNewInputShow.value = true
  expand.value = true
  setTimeout(() => {
    newInputRef.value?.focus()
  })
}
props.tree.addRequestHandler(requestCB)
</script>
  
<template>
  <div @click="_click" class="simple-list-item tree-item" :style="extraStyle" :class="extraClass" tabindex="0" @keydown="editName">
    <!-- <div v-if="isLeaf"></div> -->
    <div class="node-item">
      <div v-if="!isLeaf" class="hint" :class="{'hint-expand': expand}">></div>
      <span v-if="!isLeaf">&nbsp;</span>
      <input ref="editorRef" v-if="editMode" type="text"
        v-model="editorInput" class="name-edit"
        @blur="editNameQuit" @keydown="editNameKD">
      <div v-show="!editMode">{{ tree.title }}</div>
    </div>
  </div>
  <div v-if="expand" class="sub-indent">
    <div class="branch"></div>
    <input ref="newInputRef" v-if="isNewInputShow" type="text"
      v-model="newNameRef" class="name-edit"
      @blur="newInputQuit" @keydown="newInputKD">
    <TreeItem v-for="item in tree.children"
      :tree="item"
      :styleFunc="styleFunc"
      :classFunc="classFunc"
      :click="click"
      :editable="editable"
      :editCb="editCb"
      :requestFinishCb='requestFinishCb'/>
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
    
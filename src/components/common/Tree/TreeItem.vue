<script setup lang="ts">
import { ref, StyleValue } from 'vue'
import { Tree, BaseNode } from '../../../util/datastructure/tree';

import { useLocalStorage } from '@vueuse/core'
import { computed } from '@vue/reactivity';
import TreeItemSub from './TreeItemSub.vue';

// defineOp

const emits = defineEmits<{
  (event: 'clickTree', tree: Tree<BaseNode>): void,
  (event: 'dblclickTree', tree: Tree<BaseNode>): void,
  (event: 'contextmenuTree', tree: Tree<BaseNode>): void,
}>()

const props = defineProps<{
  tree: Tree<any>,
  asRoot?: boolean

  styleFunc?: (n: any) => StyleValue,
  classFunc?: (n: any) => any,
  editable?: boolean
  editCb?: (tree: Tree<any>, newTitle: string) => any,
  createCb?: (from: Tree<any>, newName: string) => void,
}>()

const isLeaf = props.tree.isLeaf()
// const expand = node.children && !(node.children.length === 1 && node.children[0].title === 'example')
const expand = useLocalStorage(props.tree.hierarchy().map(x => x.title).join('-'), false)

const clickSelf = () => {
  expand.value = !expand.value
  emits('clickTree', props.tree)
}

const dblclickSelf = () => {
  emits('dblclickTree', props.tree)
}

const contextmenuSelf = () => {
  emits('contextmenuTree', props.tree)
}
const clickTree = (tree: Tree<BaseNode>) => {
  emits('clickTree', tree)
}

const dblclickTree = (tree: Tree<BaseNode>) => {
  emits('dblclickTree', tree)
}

const contextmenuTree = (tree: Tree<BaseNode>) => {
  emits('contextmenuTree', tree)
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
  if (!props.createCb) {
    return
  }
  props.createCb(props.tree, newNameRef.value)
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

const newSub = () => {
  isNewInputShow.value = true
  expand.value = true
  setTimeout(() => {
    newInputRef.value?.focus()
  })
}

props.tree.bindInst({
  newSub,
})
</script>
  
<template>
  <div v-if="!asRoot" class="simple-list-item tree-item" :style="extraStyle" :class="extraClass" tabindex="0" @keydown="editName"
    @click="clickSelf" @dblclick="dblclickSelf" @contextmenu="contextmenuSelf" >
    <!-- <div v-if="isLeaf"></div> -->
    <div class="node-item">
      <div v-if="!isLeaf" class="hint" :class="{'hint-expand': expand}">></div>
      <span v-if="!isLeaf">&nbsp;</span>
      <input ref="editorRef" v-if="editMode" type="text"
        v-model="editorInput" class="simple-input"
        @blur="editNameQuit" @keydown="editNameKD">
      <div v-show="!editMode">{{ props.tree.title }}</div>
    </div>
  </div>
  <div v-if="expand || asRoot" class="sub-indent" :class="{ 'root-no-padding': asRoot }">
    <div v-if="!asRoot" class="branch"></div>
    <input ref="newInputRef" v-if="isNewInputShow" type="text"
      v-model="newNameRef" class="simple-input"
      @blur="newInputQuit" @keydown="newInputKD">

    <TreeItemSub
      :tree="props.tree"
      :styleFunc="props.styleFunc"
      :classFunc="props.classFunc"
      :editable="props.editable"
      :editCb="props.editCb"
      :createCb='props.createCb'
      @clickTree="clickTree"
      @dblclickTree="dblclickTree"
      @contextmenuTree="contextmenuTree"/>
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
.root-no-padding {
  padding-left: 0!important;
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


</style>
    
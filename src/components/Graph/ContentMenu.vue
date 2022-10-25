<script setup lang="ts">
import { computed } from '@vue/reactivity';
import { onMounted, ref, watch } from 'vue'
import { Point } from '../../util/blueprint/math';
import { BPNInstance } from '../../util/blueprint/node';
import { BPSymbol } from '../../util/blueprint/symbol'
import { workspace } from '../../util/workspace'
import { pyBridge } from '../../util/python'
import { builtins } from '../../util/blueprint/builtins';
import { editorBus } from '../../util/editor';

/**
 * Layout
 */

const emit = defineEmits<{
  (event: 'close'): void
}>()

const rootRef = ref(null as (null | HTMLElement))

/**
 * Symbols
 */

const symbols = ref([] as BPSymbol[])
onMounted(() => {

  // builtin import
  builtins.forEach(item => symbols.value.push(item))

  // console.log(builtins[0].isBuiltin())

  // python symbol import
  pyBridge.value.init().then(() => {
    pyBridge.value.getFlats().forEach(item => symbols.value.push(item))
  })
})

/**
 * 
 * Search
 * 
 */

const SEARCH_DISPLAY_LIMIT = 1000
// const searchText = ref('req.get')
// const searchText = ref('print')
const searchText = ref('urllib')
const forceShowAll = ref(false)
const searchResult = computed(() => {
  if (searchText.value === '') {
    return []
  }
  forceShowAll.value = false
  return BPSymbol.search(searchText.value, symbols.value)
})
const srBuiltin = computed(() => searchResult.value.filter(x => x.isBuiltin()))
const srClass = computed(() => searchResult.value.filter(x => x.isClass()))
const srFunction = computed(() => searchResult.value.filter(x => x.isFunction()))
const srVar = computed(() => searchResult.value.filter(x => x.isConst()))

const instantiate = (s: BPSymbol) => {
  if (!rootRef.value) {
    return
  }

  const genPos: Point = {
    y: rootRef.value.offsetTop,
    x: rootRef.value.offsetLeft,
  }

  const node = new BPNInstance(s.toBPN())
  node.position = genPos

  editorBus.value.tab?.context?.nodes.push(node)

  emit('close')
}

const displayFrom = (s: string): string => {
  const joint = ' > '
  let res = s.split('.').join(joint)
  if (res) {
    res += joint
  }
  return res
}
</script>
  
<template>
  <div class="bp-menu" @click.stop @mousedown.stop ref="rootRef">
    <!-- <div class="title">
      根符号
    </div> -->
    <div class="search-row">
      <input type="text" class="search-box" v-model="searchText" placeholder="search symbols...">
    </div>
    <div v-if="workspace" class="search-option-scroll scroll-appearance">
      <div v-if="searchResult.length >= SEARCH_DISPLAY_LIMIT && !forceShowAll" class="simple-list-item">
        共{{searchResult.length}}条结果, <span class="text-link" @click="forceShowAll=true">展开显示</span>
      </div>
      <div v-if="searchResult.length < SEARCH_DISPLAY_LIMIT || forceShowAll" class="search-option-list">
        <div v-if="srBuiltin.length">
          <div v-for="item in srBuiltin" class="simple-list-item click hover-hl" @click="instantiate(item)">
            <span class="name-package">{{ displayFrom(item.from) }}</span>
            <span class="name-class">{{ item.name }}&nbsp;</span>
            <span>{{ item.desc }}</span>
          </div>
        </div>
        <div v-if="srClass.length">
          <div class="title name-class">> 类</div>
          <div v-for="item in srClass" class="simple-list-item click hover-hl" @click="instantiate(item)">
            <span class="name-package">{{ displayFrom(item.from) }}</span>
            <span class="name-class">{{ item.name }}&nbsp;</span>
            <span>{{ item.desc }}</span>
          </div>
        </div>
        <div v-if="srFunction.length">
          <div class="title name-function">> 函数</div>
          <div v-for="item in srFunction" class="simple-list-item click hover-hl" @click="instantiate(item)">
            <span class="name-package">{{ displayFrom(item.from) }}</span>
            <span class="name-function">{{ item.name }}&nbsp;</span>
            <span>{{ item.desc }}</span>
            <!-- <span>(</span>
            <span v-for="(iitem, index) in item.functionSignature">
              <span>{{ index == 0 ? '' : ', ' }}</span>
              <span>{{iitem.param}}</span>
              <span>{{ iitem.type == 'inspect._empty' ? '' : `, ${iitem.type}` }}</span>
            </span>
            <span>)</span> -->
          </div>
        </div>
        <div v-if="srVar.length">
          <div class="title name-constant">> 常量引用</div>
          <div v-for="item in srVar" class="simple-list-item click hover-hl" @click="instantiate(item)">
            <span class="name-package">{{ displayFrom(item.from) }}</span>
            <span class="name-constant">{{ item.name }}&nbsp;</span>
            <span>{{ item.desc }}</span>
            <!-- <span class="name-class">:&nbsp;{{ item.varType }}</span> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
<style scoped lang="scss">
.bp-menu {
  width: 360px;
  height: 540px;
  background-color: #202020;
  z-index: 100;
  position: absolute;
  box-shadow: 0 0 2rem rgb(0 0 0 / 25%);
  border-radius: 0.25rem;
  overflow: hidden;
  display: flex;
  flex-flow: column;
}

.title {
  background-color: #333333;
  display: flex;
  align-items: center;
  padding: 0 8px;
  height: 24px;
}

.search-row {
  width: 100%;
  // padding: 8px;
  // border-bottom: 1px solid #666666;
}

.search-box {
  width: 100%;
  height: 2rem;
  // border-radius: 0.25rem;
  border: none;
  padding: 0 1rem;
  background-color: #666666;
  // outline: 2px solid #666666;
  outline: none;
  color: white;

  &::placeholder {
    color: #888;
  }
}

.search-option-scroll {
  flex-grow: 1;
}
</style>
  
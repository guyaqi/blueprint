<script setup lang="ts">
import { BaseFile, TextFile } from '../../util/os/file';
import { onMounted, ref } from 'vue'
import hljs from 'highlight.js'

const pp = defineProps<{ file: BaseFile, title: string }>()

const tf = TextFile.from(pp.file)
const text = tf.text
const lino = ref('')

const linoEl = ref(null as (null | HTMLElement))
const codeEl = ref(null as (null | HTMLElement))

const classList = ref([] as string[])
const linoWidth = ref(24)

const getLangFromName = (n: string): string => {
  let lang: string|undefined = undefined
  const postfixList = [
    ['.py', 'python'],
    ['.json', 'json'],
  ]

  for (const item of postfixList) {
    if (n.endsWith(item[0])) {
      return item[1]
    }
  }
  if (!lang) {
    lang = 'text'
  }

  return lang
}

onMounted(() => {
  let lines = 0
  for (const c of text) {
    if (c == '\n') {
      lines += 1
    }
  }
  for (let i=0;i<lines;i++) {
    lino.value += `${i+1}\n`
  }
  lino.value += `${lines+1}\n`

  // highlight
  classList.value.push(getLangFromName(pp.title))
  setTimeout(() => {
    hljs.highlightBlock(codeEl.value!)
  })

  setTimeout(() => {
    const w = linoEl.value!.getBoundingClientRect().width
    linoWidth.value = w
  })
})
</script>
  
<template>
  <div class="root">
    <div class="hint">
      <div class="view-icon" :style="{ 'width': linoWidth+'px' }">
        <img src="../../assets/images/view.svg" alt="">
      </div>
      <div class="pl-2 hint-text">View only, blueprint is not a code editor.</div>
    </div>
    <div class="main-wrap scroll-appearance">
      <div class="main">
        <div class="lino" ref="linoEl">{{ lino }}</div>
        <div class="code" ref="codeEl" :class="classList" style="background-color: transparent;">{{ text }}</div>
      </div>
    </div>
    
  </div>
</template>
  
<style scoped lang="scss">
.root {
  width: 100%;
  height: calc(100% - 32px);
}
.hint {
  height: 24px;
  display: flex;
  align-items: center;
  background-color: #325746;
}
.main-wrap {
  width: 100%;
  height: calc(100% - 24px);
  overflow: auto;
}
.main {
  display: flex;
  width: 100%;
  min-height: 100%;
  height: fit-content;
}
.lino {
  background-color: #444;
  min-height: 100%;
  padding: 0 .5rem;
  white-space: pre;
  text-align: center;
}
.code {
  white-space: pre;
  padding: 0 0.25rem;
  flex-grow: 1;
}

.view-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #008e4b;
}

</style>
<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { shell, ComponentInstance } from '../../util/logger'
import HtmlLine from './HtmlLine.vue';
import LoggerMenu from './LoggerMenu.vue';
import { getRandomProverbs } from '../../util/proverbs';
import TestDisplayer from '../common/TestDisplayer.vue';

// defineProps<{ msg: string }>()

// const count = ref(0)

const lines = ref([] as ComponentInstance[])

shell.onLog(log => {
  for (let i = 0; i < log.length - lines.value.length; i++) {
    lines.value.push(log[lines.value.length + i])
    scrollBot()
  }
})



// for (const person of persons) {
//   shell.logText(person.toString())
// }

const log = (str: string) => {
  shell.logText(str)
}

const scrollView = ref(null as (null | HTMLElement))
const scrollContent = ref(null as (null | HTMLElement))



const scrollBot = () => {
  const view = scrollView.value!
  const content = scrollContent.value!

  // const y = content.getBoundingClientRect().height - view.getBoundingClientRect().height
  const y = 999999
  
  setTimeout(() => {
    view.scrollTo({
      top: y,
      behavior: 'smooth'
    })
  })
}

onMounted(async () => {
  // shell.logText('The website is built with vite. https://vitejs.dev/')
  // shell.logText('By using "File System Access API", you can save your blueprints in your computer safely and conveniently. For more infomation: https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API')
  log('Blueprint - codeless programing v0.1.0 alpha')
  log('[Do you know] ' + getRandomProverbs())
  const res = await fetch('/todo.md')
  const text = await res.text()
  log(text)

  window.setTimeout(() => {
    scrollBot()
  }, 1000)
})



</script>

<template>
  <div class="box">
    <div class="head">
      <div class="mr-2">Log</div>
      <!-- <TestDisplayer :msg="r" /> -->
      <!-- <div>{{ r }}</div> -->
    </div>
    <div class="main-wrapper">
      <LoggerMenu />
      <div ref="scrollView" class="scroll-view scroll-appearance">
        <div ref="scrollContent" class="scroll-content">
          <div class="line" v-for="line in lines">
            <!-- <div class="pre-line">></div> -->
            <!-- <div class="line-content" v-html="line"></div> -->
            <HtmlLine v-if="line.component === 'HtmlLine'" :html="line.props.html" :style="line.props.style" />
            <!-- <component v-bind:is="line.component" ...line.props /> -->
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<style scoped lang="scss">
.box {
  width: 100%;
  height: 240px;
  background-color: #202124;
  // border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-flow: column;
  align-items: stretch;
  // position: absolute;
  // left: 0;
  // bottom: 0;
}

.main-wrapper {
  display: flex;
  width: 100%;
  height: calc(100% - 32px);
}

.scroll-view {

  overflow: auto;
  flex-grow: 1;
  height: 100%;

  &>.scroll-content {
    padding: 6px 0;
    width: 100%;
  }
}

.line {
  padding: 0 8px;
  position: relative;
  display: flex;
  // align-items: center;
}

.pre-line {
  position: absolute;
}
</style>

<script setup lang="ts">
import { onMounted, Ref, ref, watch } from 'vue'
import store from '../../store';
import { Point } from '../../util/blueprint/math';
import { BPSType, BPS, BPSInstance } from '../../util/blueprint/slot';
import BSlotIcon from '../Graph/BSlotIcon.vue';
import { workspace } from '../../util/workspace'
import { computed } from '@vue/reactivity';

const { instance, } = defineProps<{ instance: BPSInstance }>()

const config = instance.config

const isProcess = config.type == BPSType.PROCESS
const isData = config.type == BPSType.DATA
const isLiterial = config.type == BPSType.LITERIAL

const iconRef = ref(null as (null | HTMLElement))


const click = () => {
  if (isLiterial) {
    return
  }
  workspace.value.oCtx!.clickSlot(instance)
}

const root: Ref<null | HTMLElement> = ref(null)
let canvasEl: (null | HTMLElement) = null

const NODE_CLASSNAME = 'bp-node'

// (mutationsList: any, observer: any)
const mountedNodeMove = () => {
  if (isLiterial) {
    return
  }
  let iconRect = iconRef.value!.getBoundingClientRect()
  const canvasRect = canvasEl!.getBoundingClientRect()

  const position: Point = {
    x: iconRect.left + iconRect.width / 2 - canvasRect.left,
    y: iconRect.top + iconRect.height / 2 - canvasRect.top,
  }

  instance.position = position
}

onMounted(() => {
  canvasEl = document.querySelector('.graph-canvas')

  let parent = root.value!.parentNode as HTMLElement
  for(let i=0; i<10; i++) {
    if (parent.classList.contains(NODE_CLASSNAME)) {
      break
    }
    if (!parent.parentElement) {
      break
    }
    parent = parent.parentElement as any
  }
  if (!parent.classList.contains(NODE_CLASSNAME)) {
    console.error('slot initial failed', parent)
  }
  
  const observer = new MutationObserver((mutationsList: any, observer: any) => { mountedNodeMove() });

  observer.observe(parent as Node, { attributes: true, childList: true, subtree: true });

  mountedNodeMove()

  if (isLiterial && instance.literial === undefined) {
    instance.literial = ''
  }
})

// const literialInput = ref(instance.literial) // instance.literial
// watch(literialInput, (val) => {
//   if (!val) {
//     return
//   }
//   console.log('merge')
//   instance.literial = val
// })
// setTimeout(() => {
//   if (isLiterial) {
//     console.log(instance)
//     console.log(instance.id)
//     console.log(instance.literial)
//     // literialInput.value = instance.literial
//   }
// }, 1000)
</script>
  
<template>
  <div ref="root" class="bslot-root" @mousedown.stop @click.stop="click">
    <div v-if="isLiterial" class="bslot">
      <div v-if="config.name">{{ config.name }}</div>
      <input class="slot-input" src="" alt="" v-model="instance.literial">
    </div>
    <div v-else class="bslot">
      <div v-if="!config.isOut" ref="iconRef">
        <BSlotIcon :slot-type="config.type" :connect="true" />
      </div>
      <div v-if="config.name">{{ config.name }}</div>
      <div ref="iconRef" v-if="config.isOut">
        <BSlotIcon :slot-type="config.type" :connect="true" />
      </div>
    </div>
  </div>
</template>
  
<style scoped lang="scss">
.bslot {
  display: flex;
  align-items: center;
  // padding: 0 6px;
  height: 32px;
  width: fit-content;
  white-space: pre;
}

.slot-input {
  background-color: transparent;
  outline: none;
  border: 1px solid #333333;
  border-radius: 3px;
  width: 120px;
  margin: 0 8px;
  color: white;
}
</style>
    
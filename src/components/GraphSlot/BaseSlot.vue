<script setup lang="ts">
import { onMounted, Ref, ref, watch } from 'vue'
import { Point } from '../../util/blueprint/math';
import { BPSType, BPS, BPSInstance } from '../../util/blueprint/slot';
import BSlotIcon from '../Graph/BSlotIcon.vue';
import { editorBus } from '../../util/editor';
import { canvasBus } from '../../util/canvas';

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
  editorBus.value.tab?.content?.clickSlot(instance)
}

const root: Ref<null | HTMLElement> = ref(null)

const NODE_CLASSNAME = 'node-wrapper'

// (mutationsList: any, observer: any)
const mountedNodeMove = () => {
  if (isLiterial) {
    return
  }
  let iconRect = iconRef.value!.getBoundingClientRect()

  const canvasPos = canvasBus.value.transformLayerPos

  const position: Point = {
    x: iconRect.left + iconRect.width / 2 - canvasPos.x,
    y: iconRect.top + iconRect.height / 2 - canvasPos.y,
  }

  instance.position = position
}

onMounted(() => {
  let parent = root.value!.parentNode as HTMLElement
  while (true) {
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

  observer.observe(parent as Node, { attributes: true });

  setTimeout(() => {
    mountedNodeMove()
  })

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
    
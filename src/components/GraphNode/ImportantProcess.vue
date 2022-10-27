<script setup lang="ts">
import { BPNInstance } from '../../util/blueprint/node';
import { useBPNH } from '../../util/hooks';
import SlotWrapper from '../GraphSlot/SlotWrapper.vue';

const { instance, preview } = defineProps<{ instance: BPNInstance, preview?: boolean }>()

const { config } = instance
const isPreview = !!preview

// const {
//   style,
//   mousedown,
//   nodeDom,
// } = useBPNH(instance, isPreview)

</script>
  
<template>
  <div class="bp-node" ref="nodeDom">
    <div class="ip-head">
      <div class="name">{{ config.name }}</div>
      <div v-if="config.remark" class="remark">{{ config.remark }}</div>
    </div>

    <div class="main">
      <div class="col">
        <SlotWrapper v-for="si in instance.inslots" :instance="si" />
      </div>

      <div class="col p-3"></div>

      <div class="col outSlot-list">
        <SlotWrapper v-for="si in instance.outslots" :instance="si" />
      </div>
    </div>
  </div>
</template>
  
<style scoped lang="scss">



.ip-head {
  background-image: radial-gradient(farthest-corner at 0 0, #b700ff 0%, #333 100%);
  width: 100%;
  height: fit-content;
  line-height: 32px;
  // display: flex;
  // align-items: center;
  white-space: pre;
  padding: 4px 8px;

  // .head-icon {
  //   width: 24px;
  //   height: 24px;
  //   margin-right: 8px;
  // }

  
}


.bbody {
  text-align: center;
  line-height: 32px;
  padding: 0 16px;
  white-space: pre;
}

.main {
  display: flex;
}

.outSlot-list {
  align-items: flex-end;
}
</style>
    
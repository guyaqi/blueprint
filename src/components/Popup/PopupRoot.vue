<script setup lang="ts">
import { computed, ref } from 'vue'
import { popup, PopupWindow }  from '../../util/popup'
import FunctionEditor from './FunctionEditor.vue'

</script>
  
<template>
  <div class="popup-root" v-show="popup.isShown">
    <FunctionEditor v-if="popup.isShown && popup.windowShown == PopupWindow.FunctionEditor" :node="popup.currentBPN!" />
  </div>
</template>
  
<style scoped lang="scss">

.popup-root {
  width: 100%;
  height: 100%;
  z-index: 1000;
  position: absolute;
  background-color: #0008;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
  
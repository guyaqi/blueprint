<script setup lang="ts">
import { computed } from '@vue/reactivity';
import { os } from '../../util/os';
import { onMounted, ref } from 'vue'
import { status, StatusEnum } from '../../util/status'
import python from '../../util/python';
import { main } from '../../util/main';

const statusItems = computed(() => status.value.items)

// test
// status.value.items.push({
//   statusName: 'Builtin',
//   status: StatusEnum.OK
// },{
//   statusName: 'Python',
//   status: StatusEnum.WARNING
// },{
//   statusName: 'Rust',
//   status: StatusEnum.ERROR
// })

const colorMap = new Map<StatusEnum, string>([
  [StatusEnum.OK, '#00ffa8'],
  [StatusEnum.WARNING, '#ffe500'],
  [StatusEnum.ERROR, '#ff006a'],
])

const getColor = (status: StatusEnum) => {
  return colorMap.get(status)
}

// const a = 'https://www.electronjs.org/zh/docs/latest/api/app'
const a = 'https://docs.python.org/3/library/ast.html'



onMounted(async () => {

  await main()
})

</script>
  
<template>
  <div class="status-bar">
    <div class="status-item" v-for="item in statusItems">
      <div class="status" :style="{ backgroundColor: getColor(item.status) }"></div>
      <div class="name">{{ item.statusName }}</div>
    </div>
    <a class="mx-2" :href="a" target="_blank">{{ a }}</a>
  </div>
</template>
  
<style scoped lang="scss">
.status-bar {
  background-color: #333;
  height: 24px;
  width: 100%;
  display: flex;
  align-items: center;

  overflow: hidden;

  .status-item {

    display: flex;
    align-items: center;
    margin: 0 4px;

    .status {
      border-radius: 8px;
      width: 8px;
      height: 8px;
      margin-right: 4px;
    }

    .name {}
  }
}
</style>
  
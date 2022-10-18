import { createStore } from 'vuex'
// import { BlueprintService } from './util/blueprint/service'
// import { chooseWorkspace } from './util/workspace'
import { shell } from './util/logger'

// Create a new store instance.
const store = createStore({
  state () {
    return {
      // service: null as (BlueprintService | null),
      // workspaceHandler: null as (FileSystemDirectoryHandle | null),
      graphMouseHold: false,
      graphMouseEvent: null as (null | MouseEvent),
    }
  },
  mutations: {
    // service (state, payload: BlueprintService) {
    //   state.service = payload
    // },
    graphMouseHold (state, payload: boolean) {
      state.graphMouseHold = payload
    },
    graphMouseEvent (state, payload: MouseEvent) {
      state.graphMouseEvent = payload
    },
  },
  actions: {
    // async serviceConnect(context) {
    //   if (context.state.service) {
    //     return
    //   }
    //   const wsHdl = await chooseWorkspace()
      
    //   const res = await BlueprintService.from(wsHdl)
      
    //   if (res == null) {
    //     shell.logText(`错误的工作区(不包含 blueprint.py), 打开工作区失败`)
    //   }
    //   else {
    //     context.commit('service', res)
    //   }
    // },
    // async fakeConnect(context) {
    //   if (context.state.service) {
    //     return
    //   }
    //   const res = await BlueprintService.fake()
    //   context.commit('service', res)
    // }
  }
})

export default store
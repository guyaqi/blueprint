import { ref } from "vue"

const { ipcRenderer } = require("electron")

class Network {

  mapBatchRequest: Map<number, any>

  getRandomBatch() {
    return Math.ceil(Math.random() * 100000000)
  }
  
  request(input: RequestInfo | URL, init?: RequestInit | undefined): Promise<Response> {
    const batch = this.getRandomBatch()
    ipcRenderer.send('http-request', batch, input, init)
    // const res = fetch(input, init)
    return new Promise((resolve, reject) => {
      this.mapBatchRequest.set(batch, resolve)
    })
  }

  httpRequestCb = (ev: any, batch: number, responce: Promise<Response>) => {
    
    const solveFunc = this.mapBatchRequest.get(batch)
    if (!solveFunc) {
      return
    }
    solveFunc(responce)
    this.mapBatchRequest.delete(batch)
  }

  constructor() {
    this.mapBatchRequest = new Map<number, any>()
    ipcRenderer.on('http-request', this.httpRequestCb)
  }
}

export const network = ref(new Network())
export default network
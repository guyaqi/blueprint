
export enum BPDType {
  INT,
  FLOAT,
  STRING,
  // STRUCT, // 类型嵌套暂不支持
  ANY,
}

// export class BPD {
  
  

//   constructor(type: BPDType, inner: any) {
//     this.type = type
//     this.inner = inner
//   }
// }

export class BPDInstance {
  type: BPDType
  name: string
  inner: any
  
  constructor(type: BPDType, name: string, inner: any) {
    this.type = type
    this.name = name
    this.inner = inner
  }
}
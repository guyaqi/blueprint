import { ref } from "vue";

export enum StatusEnum {
  OK,
  WARNING,
  ERROR,
}

export interface StatusItem {
  statusName: string
  status: StatusEnum
}

export class Status {
  items: StatusItem[] = []

  listen(item: StatusItem) {
    this.items.push(item)
  }
}

export const status = ref(new Status())
// 关于蓝图的数学类

export class Point {
  x: number = 0
  y: number = 0
}

export class Line {
  x1: number = 0
  y1: number = 0

  x2: number = 0
  y2: number = 0

  constructor(p1: Point, p2: Point) {
    this.x1 = p1.x
    this.y1 = p1.y
    this.x2 = p2.x
    this.y2 = p2.y
  }
}
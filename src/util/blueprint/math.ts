// 关于蓝图的数学类

export class Point {
  x: number = 0
  y: number = 0

  constructor(
    x: number = 0,
    y: number = 0,
  ) {
    this.x = x
    this.y = y
  }
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

export class Rect {
  x: number = 0
  y: number = 0
  width: number = 0
  height: number = 0

  // get p1(): Readonly<Point> {
  //   return new Point(this.x, this.y)
  // }

  // get p2(): Readonly<Point> {
  //   return new Point(this.x + this.width, this.y + this.height)
  // }

  constructor(
    x: number = 0,
    y: number = 0,
    width: number = 0,
    height: number = 0,
  ) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  containPoint(p: Point): boolean {
    return (
      p.x >= this.x &&
      p.y >= this.y &&
      p.x <= this.x + this.width &&
      p.y <= this.y + this.height
    )
  }

  contain(r: Rect): boolean {
    return (
      r.x >= this.x &&
      r.y >= this.y &&
      r.x + r.width <= this.x + this.width &&
      r.y + r.height <= this.y + this.height
    )
  }

  collide(r: Rect): boolean {
    return (
      this.containPoint(new Point(r.x, r.y)) ||
      this.containPoint(new Point(r.x + r.width, r.y)) ||
      this.containPoint(new Point(r.x, r.y + r.height)) ||
      this.containPoint(new Point(r.x + r.width, r.y + r.height))
    )
  }

  static fromDom(param : DOMRect | HTMLElement): Rect {
    let domRect: DOMRect
    if (param instanceof DOMRect) {
      domRect = param
    }
    else if (param instanceof HTMLElement) {
      domRect = param.getBoundingClientRect()
    }
    else {
      console.error(param)
      throw new Error(`gg Rect.fromDom: param should be DOMRect nor HTMLElement`)
    }

    return new Rect(domRect.x, domRect.y, domRect.width, domRect.height)
  }

  static fromPoints(p1: Point, p2: Point): Rect {
    const x = Math.min(p1.x, p2.x)
    const y = Math.min(p1.y, p2.y)
    const width = Math.abs(p1.x - p2.x)
    const height = Math.abs(p1.y - p2.y)
    return new Rect(x, y, width, height)
  }
}
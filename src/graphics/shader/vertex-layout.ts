export class VertexLayout {
  #attributes: VertexAttribute[] = [];
  #mode: GPUVertexStepMode = "vertex";

  constructor() {}

  public add(attribute: VertexAttribute): this;
  public add(attribute: VertexAttribute[]): this;
  public add(attribute: VertexAttribute | VertexAttribute[]) {
    const attributes = Array.isArray(attribute) ? attribute : [attribute];

    for (const attrib of attributes) {
      this.#attributes.push(attrib);
    }

    return this;
  }

  public mode(mode: GPUVertexStepMode): this {
    this.#mode = mode;
    return this;
  }

  public calculate(): GPUVertexBufferLayout {
    const attributes: GPUVertexAttribute[] = [];
    let offset = 0;

    for (const attribute of this.#attributes) {
      attributes.push({
        shaderLocation: attribute.location,
        offset: offset,
        format: attribute.format,
      });

      offset += attribute.size;
    }

    return {
      attributes,
      arrayStride: offset,
      stepMode: this.#mode,
    };
  }

  public static create(attribute?: VertexAttribute): VertexLayout;
  public static create(attribute?: VertexAttribute[]): VertexLayout;
  public static create(
    attribute?: VertexAttribute | VertexAttribute[]
  ): VertexLayout {
    const layout = new VertexLayout();

    if (attribute) {
      // Not sure why i have to re-coerce this into an array
      const attributes = Array.isArray(attribute) ? attribute : [attribute];
      layout.add(attributes);
    }

    return layout;
  }
}

export class VertexAttribute {
  public type: VertexAttributeType;
  public count: number = 1;
  public location: number;

  constructor(type: VertexAttributeType, location: number, count: number = 1) {
    this.type = type;
    this.count = count;
    this.location = location;
  }

  public get size(): number {
    return bytesPerType(this.type);
  }

  public get format(): GPUVertexFormat {
    return formatForType(this.type);
  }
}

export enum VertexAttributeType {
  Float = "Float",
  Vec2 = "Vec2",
  Vec3 = "Vec3",
  Vec4 = "Vec4",
  // Mat2 = "Mat2",
  // Mat3 = "Mat3",
  // Mat4 = "Mat4",
}

export function Float(location: number) {
  return new VertexAttribute(VertexAttributeType.Float, location);
}

export function Vec2(location: number) {
  return new VertexAttribute(VertexAttributeType.Vec2, location);
}

export function Vec3(location: number) {
  return new VertexAttribute(VertexAttributeType.Vec3, location);
}

export function Vec4(location: number) {
  return new VertexAttribute(VertexAttributeType.Vec4, location);
}

export function bytesPerType(type: VertexAttributeType) {
  switch (type) {
    case VertexAttributeType.Float:
      return 4;

    case VertexAttributeType.Vec2:
      return 4 * 2;

    case VertexAttributeType.Vec3:
      return 4 * 3;

    case VertexAttributeType.Vec4:
      return 4 * 4;

    // case VertexAttributeType.Mat2:
    //   return 4 * 2 * 2;
    //
    // case VertexAttributeType.Mat3:
    //   return 4 * 3 * 3;
    //
    // case VertexAttributeType.Mat4:
    //   return 4 * 4 * 4;
  }
}

export function formatForType(type: VertexAttributeType): GPUVertexFormat {
  switch (type) {
    case VertexAttributeType.Float:
      return "float32";

    case VertexAttributeType.Vec2:
      return "float32x2";

    case VertexAttributeType.Vec3:
      return "float32x3";

    case VertexAttributeType.Vec4:
      return "float32x4";

    // case VertexAttributeType.Mat2:
    //   return 4 * 2 * 2;
    //
    // case VertexAttributeType.Mat3:
    //   return 4 * 3 * 3;
    //
    // case VertexAttributeType.Mat4:
    //   return 4 * 4 * 4;
  }
}

// | "uint8x2"
// | "uint8x4"
// | "sint8x2"
// | "sint8x4"
// | "unorm8x2"
// | "unorm8x4"
// | "snorm8x2"
// | "snorm8x4"
// | "uint16x2"
// | "uint16x4"
// | "sint16x2"
// | "sint16x4"
// | "unorm16x2"
// | "unorm16x4"
// | "snorm16x2"
// | "snorm16x4"
// | "float16x2"
// | "float16x4"
// | "float32"
// | "float32x2"
// | "float32x3"
// | "float32x4"
// | "uint32"
// | "uint32x2"
// | "uint32x3"
// | "uint32x4"
// | "sint32"
// | "sint32x2"
// | "sint32x3"
// | "sint32x4";

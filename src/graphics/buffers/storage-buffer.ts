export class StorageBuffer {
  public buffer: Float32Array;
  public readonly stride: number;
  public readonly count: number;

  constructor(stride: number, count: number) {
    this.stride = stride;
    this.count = count;
    this.buffer = new Float32Array(stride * count);
  }

  public get byteLength(): number {
    return this.buffer.byteLength;
  }

  public get bytesPerElement(): number {
    return this.buffer.BYTES_PER_ELEMENT;
  }

  public row(rowIndex: number): Float32Array {
    return new Float32Array(
      this.buffer.buffer,
      rowIndex * this.stride * this.buffer.BYTES_PER_ELEMENT,
      this.stride
    );
  }
}

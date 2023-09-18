import { mat4, vec3 } from "gl-matrix";
import { Context } from "../gpu";

const MATRIX_LENGTH = 16;

export abstract class Camera {
  public ctx: Context;

  // Float 32 array that contains both the projection and view matrix sequentially
  public data: Float32Array;

  // Float32Array view into the data array
  // Inverse of the viewStaging array
  public view: Float32Array;

  // Float32Array view into the data array
  public projection: Float32Array;

  public position: vec3;

  // Used for manipulating view then inversed into the .view buffer
  private viewStaging: Float32Array;

  constructor(ctx: Context) {
    this.ctx = ctx;
    this.data = new Float32Array(MATRIX_LENGTH * 2); // Two mat4's
    this.view = new Float32Array(this.data.buffer, 0, MATRIX_LENGTH); // Get first matrix from buffer
    this.projection = new Float32Array(this.data.buffer, MATRIX_LENGTH * 4); // Get second matrix from buffer;
    this.position = vec3.create();

    this.viewStaging = new Float32Array(MATRIX_LENGTH);
  }

  // Should mutate `this.projection` in place
  public abstract initProjection(): void;

  public translate(vec: vec3): this {
    vec3.add(this.position, this.position, vec);
    this.recalculate();

    return this;
  }

  public init() {
    this.initProjection();
    this.recalculate();
  }

  private recalculate(): void {
    mat4.fromTranslation(this.viewStaging, this.position);
    mat4.invert(this.view, this.viewStaging);
  }

  static init<C extends Camera, T extends CameraClass<C>>(
    this: T,
    ...args: CameraConstructArgs<C, T>
  ): InstanceType<T> {
    const inst = new this(...args) as InstanceType<T>;

    inst.init();

    return inst;
  }
}

type CameraClass<C extends Camera> = {
  new (...args: any[]): C;
};

type CameraConstructArgs<
  C extends Camera,
  T extends CameraClass<C>
> = ConstructorParameters<T>;

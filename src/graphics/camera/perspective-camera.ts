import { mat4 } from "gl-matrix";
import { WebGpuCamera } from "./webgpu-camera";
import { Context } from "../gpu";

export class PerspectiveCamera extends WebGpuCamera {
  #fov: number = 90;

  constructor(ctx: Context, fov?: number) {
    super(ctx);

    if (fov) {
      this.#fov = fov;
    }
  }

  public get fov(): number {
    return this.#fov * (Math.PI / 180);
  }

  public setFov(fov: number): this {
    this.#fov = fov;
    this.initProjection();
    return this;
  }

  public override initProjection(): void {
    const fieldOfView = this.fov;

    const x = this.ctx.windowWidth;
    const y = this.ctx.windowHeight;

    const aspect = x / y;
    const zNear = 0.1;
    const zFar = 100.0;
    // const zFar = 10.0;

    mat4.perspective(this.projection, fieldOfView, aspect, zNear, zFar);
  }
}

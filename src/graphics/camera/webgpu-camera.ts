import { Context } from "../gpu";
import { Camera } from "./camera";

export abstract class WebGpuCamera extends Camera {
  public uniformBuffer: GPUBuffer;
  public bindGroupLayout: GPUBindGroupLayout;
  public bindGroup: GPUBindGroup;
  public bindGroupIndex: number = 0;

  constructor(ctx: Context) {
    super(ctx);

    this.uniformBuffer = this.ctx.device.createBuffer({
      size: this.data.byteLength,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
    });

    this.bindGroupLayout = this.ctx.device.createBindGroupLayout({
      label: "CameraBindGroupLayout",
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          buffer: {},
        },
      ],
    });

    this.bindGroup = this.ctx.device.createBindGroup({
      label: "CameraBindGroup",
      layout: this.bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: { buffer: this.uniformBuffer },
        },
      ],
    });
  }
}

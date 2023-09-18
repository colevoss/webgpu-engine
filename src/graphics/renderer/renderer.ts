import { WebGpuCamera } from "../camera";
import { Context } from "../gpu";

export class Renderer {
  public ctx: Context;

  public colorAttachment: GPURenderPassColorAttachment;

  public commandEncoder: GPUCommandEncoder;
  public passEncoder!: GPURenderPassEncoder;
  public depthStencilBuffer!: GPUTexture;
  public depthStencilView!: GPUTextureView;
  public depthStencilAttachment!: GPURenderPassDepthStencilAttachment;

  constructor(ctx: Context) {
    this.ctx = ctx;
    this.commandEncoder = this.ctx.device.createCommandEncoder();
    this.colorAttachment = this.defaultColorAttachment();
    this.createDepthSenctilAttachment();
  }

  public beginRenderPass(camera: WebGpuCamera) {
    this.commandEncoder = this.ctx.device.createCommandEncoder();
    this.passEncoder = this.commandEncoder.beginRenderPass({
      colorAttachments: [this.initColorAttachment()],
      depthStencilAttachment: this.depthStencilAttachment,
    });

    this.passEncoder.setBindGroup(camera.bindGroupIndex, camera.bindGroup);
  }

  public endRenderPass() {
    this.passEncoder.end();
    const commandBuffer = this.commandEncoder.finish();
    this.ctx.device.queue.submit([commandBuffer]);
  }

  private initColorAttachment() {
    this.colorAttachment.view = this.ctx.createTextureView();
    return this.colorAttachment;
  }

  private defaultColorAttachment(): GPURenderPassColorAttachment {
    return {
      view: this.ctx.createTextureView(),
      clearValue: { r: 1, g: 0, b: 1, a: 1 },
      loadOp: "clear",
      storeOp: "store",
    };
  }

  private createDepthSenctilAttachment() {
    const bufferDesc: GPUTextureDescriptor = {
      size: {
        height: this.ctx.canvasHeight,
        width: this.ctx.canvasWidth,
      },
      format: "depth24plus-stencil8",
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    };

    this.depthStencilBuffer = this.ctx.device.createTexture(bufferDesc);

    const viewDesc: GPUTextureViewDescriptor = {
      format: "depth24plus-stencil8",
      dimension: "2d",
      aspect: "all",
    };

    this.depthStencilView = this.depthStencilBuffer.createView(viewDesc);

    this.depthStencilAttachment = {
      view: this.depthStencilView,
      depthClearValue: 1.0,
      depthLoadOp: "clear",
      depthStoreOp: "store",

      stencilStoreOp: "discard",
      stencilLoadOp: "clear",
    };
  }
}

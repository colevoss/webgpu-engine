import { Context } from "./context";

export class GpuError {
  public ctx: Context;

  constructor(ctx: Context) {
    this.ctx = ctx;

    this.listenForUncaughtErrors();
  }

  private listenForUncaughtErrors() {
    this.ctx.device.addEventListener("uncapturederror", (event: any) => {
      console.error("A WebGPU error was not captured", event.error, event);
    });
  }

  public checkShaderCompilationInfo(shader: GPUShaderModule) {
    console.log("Checking shader compilation info...");

    shader.getCompilationInfo().then((info) => {
      for (const message of info.messages) {
        const formattedMessage = `[${message.type.toUpperCase()}] ${
          message.message
        } (${message.lineNum}: ${message.linePos})`;

        switch (message.type) {
          case "info":
            console.info(formattedMessage);
            break;

          case "warning":
            console.warn(formattedMessage);
            break;

          case "error":
            console.error(formattedMessage);
            break;
        }
      }
    });
  }

  public checkValidationError() {
    this.ctx.device.pushErrorScope("validation");
    return new GpuErrorTracker(this.ctx, "validation");
  }

  public checkInternalError() {
    this.ctx.device.pushErrorScope("internal");
    return new GpuErrorTracker(this.ctx, "internal");
  }

  public checkOutOfMemoryError() {
    this.ctx.device.pushErrorScope("out-of-memory");
    return new GpuErrorTracker(this.ctx, "out-of-memory");
  }
}

export class GpuErrorTracker {
  constructor(public ctx: Context, public type: GPUErrorFilter) {}

  public check(cb: (error: GPUError) => void): void {
    this.ctx.device.popErrorScope().then((err) => {
      if (!err) {
        return;
      }

      cb(err);
    });
  }

  public async checkAsync(): Promise<[GPUErrorFilter, GPUError | null]> {
    return this.ctx.device.popErrorScope().then((err) => {
      return [this.type, err];
    });
  }
}

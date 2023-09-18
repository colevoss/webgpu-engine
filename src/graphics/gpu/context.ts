import { GpuError } from "./errors";
import * as NewShader from "../shader";

// TODO: Track if Context is initialized
export class Context {
  public gpu: GPU;
  public adapter!: GPUAdapter;
  public device!: GPUDevice;
  public canvas!: HTMLCanvasElement;
  public context!: GPUCanvasContext;

  public scaleFactor: number = 1;

  public windowWidth: number = 0;
  public windowHeight: number = 0;

  public canvasWidth: number = 0;
  public canvasHeight: number = 0;

  public error!: GpuError;

  public shaders: NewShader.Shader[] = [];

  constructor() {
    const gpu = navigator.gpu;

    if (!gpu) {
      throw new Error("WebGPU is not supported, ya Dork");
    }

    this.gpu = gpu;
    this.scaleFactor = window.devicePixelRatio;

    console.groupEnd();
  }

  // Maybe cache this at some point
  public get preferredCanvasFormat(): GPUTextureFormat {
    return this.gpu.getPreferredCanvasFormat();
  }

  public async init(): Promise<this> {
    console.groupCollapsed("GPU");

    await this.getAdapter();
    await this.getDevice();
    this.getCanvas();

    this.configureContext();

    console.groupEnd();

    this.error = new GpuError(this);

    return this;
  }

  public createTextureView(): GPUTextureView {
    return this.context.getCurrentTexture().createView();
  }

  private async getAdapter(): Promise<this> {
    console.group("Adapter");
    console.log("Requesting");
    const adapter = await this.gpu.requestAdapter();

    if (!adapter) {
      console.error("Request failed");
      throw new Error("Failed to request adapter");
    }

    console.log("Obtained", adapter);
    this.adapter = adapter;

    console.groupEnd();
    return this;
  }

  private async getDevice(): Promise<this> {
    console.group("Device");
    console.log("Requesting");
    const device = await this.adapter.requestDevice();

    console.log("Obtained", device);
    this.device = device;

    console.groupEnd();
    return this;
  }

  private getCanvas(): this {
    console.group("Canvas");
    console.log("Requesting");
    const canvas = document.querySelector<HTMLCanvasElement>("#glcanvas");

    if (!canvas) {
      console.error("Failed");
      throw new Error("Cannot find canvas");
    }

    console.log("Obtained", canvas);

    this.canvas = canvas;
    this.scale();

    console.groupEnd();
    return this;
  }

  public scale() {
    console.group("Scaling");

    this.windowWidth = document.body.clientWidth;
    this.windowHeight = document.body.clientHeight;

    this.canvasWidth = this.windowWidth * this.scaleFactor;
    this.canvasHeight = this.windowHeight * this.scaleFactor;

    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;

    this.canvas.style.width = `${this.windowWidth}px`;
    this.canvas.style.height = `${this.windowHeight}px`;

    console.log({
      windowWidth: this.windowWidth,
      windowHeight: this.windowHeight,
      canvasWidth: this.canvasWidth,
      canvasHeight: this.canvasHeight,
    });

    console.groupEnd();
  }

  private configureContext(): this {
    console.group("<Canvas>");
    console.log("Querying");
    const context = this.canvas.getContext("webgpu");

    if (!context) {
      throw new Error("Cannot get webgpu context");
    }

    console.log("Obtained");

    this.context = context;

    const config: GPUCanvasConfiguration = {
      device: this.device,
      format: this.gpu.getPreferredCanvasFormat(),
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
      alphaMode: "opaque",
    };

    console.log("Configuring", config);

    this.context.configure(config);

    console.groupEnd();

    return this;
  }

  public static async init(): Promise<Context> {
    const gpu = new Context();
    return gpu.init();
  }

  public shader(src: NewShader.ShaderSource): NewShader.Shader {
    const shader = new NewShader.Shader(this, src);

    this.shaders.push(shader);

    return shader;
  }

  public async compile(): Promise<GPURenderPipeline[]> {
    console.group("Compiling");
    const compilers: Promise<GPURenderPipeline>[] = [];

    while (this.shaders.length > 0) {
      const shader = this.shaders.shift();

      if (!shader) {
        break;
      }

      compilers.push(shader.compile());
    }

    console.groupEnd();
    return Promise.all(compilers);
  }
}

import { Context } from "../gpu";
import { ShaderSource } from "./shader-source";
import { VertexLayout } from "./vertex-layout";

// Shader is just:
// * the Compiled shader source
// * the render pipeline layout,
// * and the bind group layout

export class Shader {
  public ctx: Context;
  public source: ShaderSource;
  public bindGroupLayouts: GPUBindGroupLayout[] = [];
  public vertexLayouts: VertexLayout[] = [];

  public pipeline!: GPURenderPipeline;

  #label!: string;
  #compiled: boolean = false;

  constructor(ctx: Context, src: ShaderSource) {
    this.ctx = ctx;
    this.source = src;
  }

  public get label(): string {
    if (!this.#label) {
      throw new Error("Shader requires a label");
    }

    return this.#label;
  }

  public setLabel(label: string): this {
    this.#label = label;
    return this;
  }

  public layout(layout: VertexLayout): this {
    this.vertexLayouts.push(layout);
    return this;
  }

  public bindGroup(layout: GPUBindGroupLayout): this {
    this.bindGroupLayouts.push(layout);
    return this;
  }

  public async compile(): Promise<GPURenderPipeline> {
    console.groupCollapsed(`Compiling Shader: ${this.label}`);

    if (this.#compiled) {
      console.log("Shader has already been compiled");
      return this.pipeline;
    }

    this.source.compile(this.ctx);

    console.log("Creating pipeline layout");
    const pipelineLayout = this.ctx.device.createPipelineLayout({
      label: this.label,
      bindGroupLayouts: this.bindGroupLayouts,
    });

    console.log("Creating pipeline");
    console.groupEnd();

    this.pipeline = await this.ctx.device.createRenderPipelineAsync({
      label: this.label,
      layout: pipelineLayout,
      vertex: this.vertexDescriptor(),
      fragment: this.fragmentDescriptor(),
      primitive: this.primitiveDescriptor(),
      depthStencil: this.depthStencilDescriptor(),
    });

    console.groupCollapsed(`Compiled Shader: ${this.label}`);
    console.log(`Shader ${this.label} Pipeline created`);

    this.#compiled = true;

    console.log("Shader compiled successfully");
    console.groupEnd();

    return this.pipeline;
  }

  private vertexDescriptor(): GPUVertexState {
    return {
      module: this.source.shader,
      entryPoint: this.source.vertexEntry,
      buffers: this.vertexLayouts.map((layout) => layout.calculate()),
    };
  }

  private fragmentDescriptor(): GPUFragmentState {
    return {
      module: this.source.shader,
      entryPoint: this.source.fragmentEntry,
      targets: [
        {
          format: this.ctx.preferredCanvasFormat,
        },
      ],
    };
  }

  private primitiveDescriptor(): GPUPrimitiveState {
    return {
      topology: "triangle-list",
    };
  }

  private depthStencilDescriptor(): GPUDepthStencilState {
    return {
      format: "depth24plus-stencil8",
      depthWriteEnabled: true,
      depthCompare: "less-equal",
    };
  }
}

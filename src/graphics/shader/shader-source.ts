import { Context } from "../gpu";

export class ShaderSource {
  public readonly source: string;
  public shader!: GPUShaderModule;

  #compiled: boolean = false;
  #label?: string;

  #fragmentEntry = "fragmentMain";
  #vertexEntry = "vertexMain";

  constructor(source: string) {
    this.source = source;
  }

  public get fragmentEntry() {
    return this.#fragmentEntry;
  }

  public get vertexEntry() {
    return this.#vertexEntry;
  }

  public get label(): string | undefined {
    return this.#label;
  }

  public setFragmentEntry(name: string): this {
    this.#fragmentEntry = name;
    return this;
  }

  public setVertexEntry(name: string): this {
    this.#vertexEntry = name;
    return this;
  }

  public setLabel(label: string): this {
    this.#label = label;
    return this;
  }

  public compile(ctx: Context): this {
    if (!this.label) {
      throw new Error("ShaderSource is missing a label");
    }

    console.groupCollapsed(`ShaderSource ${this.label}`);

    if (this.#compiled) {
      console.log("Shader source already compiled");
      console.groupEnd();
      return this;
    }

    const validation = ctx.error.checkInternalError();

    console.log("Compiling shader");
    const shader = ctx.device.createShaderModule({
      label: this.label,
      code: this.source,
    });

    this.shader = shader;

    ctx.error.checkShaderCompilationInfo(this.shader);

    validation.check((err) => {
      console.error(`Shader ${this.label} validation error: ${err.message}`);
    });

    this.#compiled = true;

    console.groupEnd();

    return this;
  }

  public static src(strings: TemplateStringsArray, ...values: string[]) {
    const source = this.concatTemplate(strings, values);
    return new ShaderSource(source);
  }

  private static concatTemplate(
    strings: TemplateStringsArray,
    values: string[]
  ) {
    return values.reduce((acc, val, i) => {
      return acc + val + strings[i + 1];
    }, strings[0]);
  }
}

// ShaderSource.src`test`.setVertexEntry('vMain').setFragmentEntry('fMain')

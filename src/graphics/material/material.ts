import { Context } from "../gpu";
import { Asset } from "./asset";

export class Material implements Asset {
  public texture!: GPUTexture;
  public view!: GPUTextureView;
  public sampler!: GPUSampler;
  // public img: ImageBitmap;

  #loaded: boolean = false;
  // public src: string;

  constructor(public ctx: Context, public src: string) {}

  public id(): string {
    return this.src;
  }

  public loaded(): boolean {
    return this.#loaded;
  }

  async loadFetch(): Promise<ImageBitmap> {
    const response = await fetch(this.src);
    console.log("Material source Fetched", response);

    const blob = await response.blob();
    console.log(blob);

    const image = await createImageBitmap(blob);

    return image;
  }

  async loadImage(): Promise<ImageBitmap> {
    const image = new Image();

    return new Promise((resolve) => {
      image.addEventListener("load", () => {
        console.log("image loaded");
        createImageBitmap(image).then((bitmap) => resolve(bitmap));
      });

      image.src = this.src;
    });
  }

  async load(): Promise<this> {
    console.groupCollapsed("Material:", this.src);
    console.time(`Material ${this.src}`);

    // const imageData = await this.loadImage();
    const imageData = await this.loadFetch();

    console.log(this.loadImageBitmap(imageData));

    const validate = this.ctx.error.checkValidationError();

    const viewDescriptor: GPUTextureViewDescriptor = {
      format: "rgba8unorm",
      dimension: "2d",
      aspect: "all",
      baseMipLevel: 0,
      mipLevelCount: 1,
      baseArrayLayer: 0,
      arrayLayerCount: 1,
    };

    this.view = this.texture.createView(viewDescriptor);

    const samplerDescriptor: GPUSamplerDescriptor = {
      addressModeU: "repeat",
      addressModeV: "repeat",
      magFilter: "linear",
      minFilter: "nearest",
      mipmapFilter: "nearest",
      maxAnisotropy: 1,
    };

    this.sampler = this.ctx.device.createSampler(samplerDescriptor);
    console.log(samplerDescriptor, this.sampler);

    validate.check((err) => {
      console.error(
        `Error occurred creating texture ${this.src}: ${err.message}`
      );
    });

    console.timeEnd(`Material ${this.src}`);
    console.groupEnd();

    this.#loaded = true;

    return this;
  }

  private loadImageBitmap(source: ImageBitmap) {
    const descriptor: GPUTextureDescriptor = {
      label: "my fuckin texture",
      // size: { width: source.width, height: source.height },
      size: { width: source.width, height: source.height },
      format: "rgba8unorm",
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT,
    };

    this.texture = this.ctx.device.createTexture(descriptor);
    console.log(this.texture);

    console.log("Copying image to texture", descriptor.size);

    this.ctx.device.queue.copyExternalImageToTexture(
      { source },
      { texture: this.texture, mipLevel: 0 },
      descriptor.size
    );

    return this.texture;
  }

  public static async init(ctx: Context, src: string) {
    const mat = new Material(ctx, src);

    await mat.load();

    return mat;
  }
}

export interface Asset {
  id(): string;
  load(): Promise<Asset>;
  loaded(): boolean;
}

export type HandleId = string;

export class AssetHandle<A extends Asset> {
  #loader: AssetLoader<A>;
  #id: HandleId;

  constructor(loader: AssetLoader<A>, id: HandleId) {
    this.#loader = loader;
    this.#id = id;
  }

  public get id(): HandleId {
    return this.#id;
  }

  public get asset(): A {
    return this.#loader.get(this);
  }

  public clone(): AssetHandle<A> {
    const clone = new AssetHandle<A>(this.#loader, this.#id);

    return clone;
  }
}

export class AssetLoader<A extends Asset> {
  #assetMap: Map<HandleId, A> = new Map();

  #assetCount = 0;
  #loadProgress = 0;

  public add(asset: A): AssetHandle<A> {
    const id = asset.id();

    const handle = new AssetHandle<A>(this, id);
    this.#assetMap.set(id, asset);

    this.#assetCount += 1;

    return handle;
  }

  public get(handle: AssetHandle<A>): A {
    const asset = this.#assetMap.get(handle.id) as A | undefined;

    if (!asset) {
      throw new Error("No asset");
    }

    return asset;
  }

  public get progress(): number {
    return this.#loadProgress / this.#assetCount;
  }

  public load(): Promise<Asset[]> {
    const loaders: Promise<Asset>[] = [];
    this.#assetMap.forEach((asset) => {
      if (asset.loaded()) {
        return;
      }

      const loader = asset.load().then((a) => {
        this.#loadProgress += 1;
        return a;
      });

      loaders.push(loader);
    });

    return Promise.all(loaders);
  }
}

import { Renderer } from "../renderer";

export abstract class Mesh {
  public abstract positions: Float32Array;
  public abstract indices: Uint16Array;
}

// prettier-ignore
export const positions = new Float32Array([
    // Vertex A
    -1.0, -1.0, 0.0, // bottom left
    // Vertex B
    1.0, -1.0, 0.0, // bottom right
    // Vertex C
    1.0, 1.0, 0.0, // top right

    -1.0, 1.0, 0.0 // top left
]);

// prettier-ignore
export const indices = new Uint16Array([
  0, 1, 2,
  2, 3, 0
]);

export class Quad extends Mesh {
  public positions = positions;
  public indices = indices;
}

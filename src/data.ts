import { mat4 } from "gl-matrix";
import { StorageBuffer } from "./graphics";

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

// Color vertex buffer data
// These represent RGB colors
// prettier-ignore
export const colors = new Float32Array([
    1.0, 0.0, 0.0, // Red 
    0.0, 1.0, 0.0, // Green
    0.0, 0.0, 1.0,  // Blue
    1.0, 0.0, 1.0  // Blue
]);

// prettier-ignore
// TODO: Document how the points align with the positions
export const texCoords = new Float32Array([
//U  V
  0, 1, // Bottom left
  1, 1, // bottom right
  1, 0, // top right
  0, 0  // top left
])

// prettier-ignore
export const indices = new Uint16Array([
  0, 1, 2,
  2, 3, 0
]);

const quadCount = 150;
const transformVal = 1.1;
const scale = 0.5;

export const transforms = new StorageBuffer(16, quadCount * quadCount);

for (let y = 0; y < quadCount; y++) {
  for (let x = 0; x < quadCount; x++) {
    const xT = x * transformVal;
    const yT = y * transformVal;

    const outerI = y * quadCount + x;

    const quadTransform = transforms.row(outerI);

    mat4.fromTranslation(quadTransform, [xT, yT, 0]);
    mat4.scale(quadTransform, quadTransform, [
      scale + y * 0.1,
      scale + y * 0.1,
      0,
    ]);
    // mat4.rotateZ(quadTransform, quadTransform, 5);
  }
}

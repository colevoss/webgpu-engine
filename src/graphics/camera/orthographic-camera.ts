import { mat4 } from "gl-matrix";
import { Camera } from "./camera";

export class OrthographicCamera extends Camera {
  public left = -1;
  public right = 1;

  public bottom = -1;
  public top = 1;

  public override initProjection(): void {
    mat4.ortho(
      this.projection,
      this.left,
      this.right,
      this.bottom,
      this.top,
      -1, // near
      1 // far
    );
  }
}

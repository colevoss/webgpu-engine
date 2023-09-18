import { ShaderSource } from "./graphics";

const CameraShaderSnippet = `
// CAMERA UNIFORM

struct Camera {
  view: mat4x4<f32>,
  projection: mat4x4<f32>,
}

@group(0) @binding(0) var<uniform> camera: Camera;

`;

export const vertexSrc = ShaderSource.src`
${CameraShaderSnippet}

// VERTEX

struct VertexInput {
  @builtin(instance_index) instance: u32,

  @location(0) inPos: vec3<f32>,
  @location(1) inColor: vec4<f32>,
  @location(2) texCoord: vec2<f32>,
}

struct VertexOutput {
  @builtin(position) Position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) TexCoord: vec2<f32>,
};

@group(1) @binding(0) var<storage> transformMatrices : array<mat4x4<f32>>;

@vertex
fn vMain(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;

  output.Position = camera.projection * camera.view * transformMatrices[input.instance] * vec4<f32>(input.inPos, 1.0);
  output.color = input.inColor;
  output.TexCoord = input.texCoord;

  return output;
}

@group(2) @binding(0) var myTexture: texture_2d<f32>;
@group(2) @binding(1) var texSampler: sampler;

@fragment
fn fMain(@location(0) inColor: vec4<f32>, @location(1) TexCoord: vec2<f32>) -> @location(0) vec4<f32> {
  // return inColor;
  return textureSample(myTexture, texSampler, TexCoord);
}
`
  .setLabel("basic")
  .setVertexEntry("vMain")
  .setFragmentEntry("fMain");

// export const fragmentSrc = ShaderSource.fragment`
// @fragment
// fn fMain(@location(0) inColor: vec4<f32>, @location(1) TexCoord: vec2<f32>) -> @location(0) vec4<f32> {
//   // return inColor;
//   return textureSample(myTexture, texSampler, TexCoord);
// }
// `;

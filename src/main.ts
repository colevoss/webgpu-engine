import "./style.css";
import {
  Context,
  Camera,
  PerspectiveCamera,
  Renderer,
  Vec2,
  Vec3,
  Material,
  AssetLoader,
  VertexLayout,
} from "./graphics";
import { vertexSrc } from "./shaders";
import { positions, colors, indices, transforms, texCoords } from "./data";

// async function sleep(ms: number) {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(null);
//     }, ms);
//   });
// }

const assetLoader = new AssetLoader<Material>();

async function main() {
  const ctx = await Context.init();
  const renderer = new Renderer(ctx);

  const camera = PerspectiveCamera.init(ctx, 90);

  // await sleep(500);

  const positionBuffer = ctx.device.createBuffer({
    size: positions.byteLength,
    usage: GPUBufferUsage.VERTEX,
    mappedAtCreation: true,
  });

  const colorBuffer = ctx.device.createBuffer({
    size: colors.byteLength,
    usage: GPUBufferUsage.VERTEX,
    mappedAtCreation: true,
  });

  const indexBuffer = ctx.device.createBuffer({
    size: indices.byteLength,
    usage: GPUBufferUsage.INDEX,
    mappedAtCreation: true,
  });

  const texCoordBuffer = ctx.device.createBuffer({
    size: texCoords.byteLength,
    usage: GPUBufferUsage.VERTEX,
    mappedAtCreation: true,
  });

  new Float32Array(texCoordBuffer.getMappedRange()).set(texCoords);
  texCoordBuffer.unmap();

  camera.translate([0, 0, 1]);

  const transformBuffer = ctx.device.createBuffer({
    size: transforms.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  const transformGroupLayout = ctx.device.createBindGroupLayout({
    label: "transform",
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX,
        buffer: {
          type: "read-only-storage",
        },
      },
    ],
  });

  const textureBindLayout = ctx.device.createBindGroupLayout({
    label: "texture",
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.FRAGMENT,
        texture: {},
      },
      {
        binding: 1,
        visibility: GPUShaderStage.FRAGMENT,
        sampler: {},
      },
    ],
  });

  const material = assetLoader.add(new Material(ctx, "myimg.png"));
  await assetLoader.load();

  const textureBindGroup = ctx.device.createBindGroup({
    layout: textureBindLayout,
    entries: [
      {
        binding: 0,
        resource: material.asset.view,
      },
      {
        binding: 1,
        resource: material.asset.sampler,
      },
    ],
  });

  const transformBindGroup = ctx.device.createBindGroup({
    layout: transformGroupLayout,
    entries: [
      {
        binding: 0,
        resource: { buffer: transformBuffer },
      },
    ],
  });

  const shader = ctx
    .shader(vertexSrc)
    .setLabel("quad")
    .bindGroup(camera.bindGroupLayout)
    .bindGroup(transformGroupLayout)
    .bindGroup(textureBindLayout)
    .layout(VertexLayout.create(Vec3(0))) // position
    .layout(VertexLayout.create(Vec3(1))) // color
    .layout(VertexLayout.create(Vec2(2))); // texCoord

  ctx.device.queue.writeBuffer(camera.uniformBuffer, 0, camera.data);
  ctx.device.queue.writeBuffer(transformBuffer, 0, transforms.buffer);

  new Float32Array(positionBuffer.getMappedRange()).set(positions);
  positionBuffer.unmap();

  new Float32Array(colorBuffer.getMappedRange()).set(colors);
  colorBuffer.unmap();

  new Uint16Array(indexBuffer.getMappedRange()).set(indices);
  indexBuffer.unmap();

  function draw() {
    ctx.device.queue.writeBuffer(camera.uniformBuffer, 0, camera.data);
    renderer.beginRenderPass(camera);

    {
      renderer.passEncoder.setBindGroup(1, transformBindGroup);
      renderer.passEncoder.setBindGroup(2, textureBindGroup);
      // renderer.passEncoder.setPipeline(shader.renderPipeline);
      renderer.passEncoder.setPipeline(shader.pipeline);
    }

    {
      renderer.passEncoder.setVertexBuffer(0, positionBuffer);
      renderer.passEncoder.setVertexBuffer(1, colorBuffer);
      renderer.passEncoder.setVertexBuffer(2, texCoordBuffer);
      renderer.passEncoder.setIndexBuffer(indexBuffer, "uint16");
      renderer.passEncoder.drawIndexed(6, transforms.count);
    }

    renderer.endRenderPass();

    requestAnimationFrame(draw);
  }

  handleInput(camera);
  ctx.compile().then(() => {
    console.log("asdf");
    draw();
  });
}

function handleInput(camera: Camera) {
  document.addEventListener("keydown", (event) => {
    let x = 0;
    let y = 0;
    switch (event.code) {
      case "KeyS":
        y = -0.1;
        break;
      case "KeyW":
        y = 0.1;
        break;
      case "KeyD":
        x = 0.1;
        break;
      case "KeyA":
        x = -0.1;
        break;
      default:
        return;
    }

    camera.translate([x, y, 0]);
  });

  document.addEventListener("wheel", (event) => {
    const move = event.deltaY * 0.001;
    camera.translate([0, 0, move]);
  });
}

main();

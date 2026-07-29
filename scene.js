import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js';

const canvas = document.querySelector('#scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.02;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x090a0d, 0.075);

const camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, .25, 9.3);

const clock = new THREE.Clock();
const pointer = new THREE.Vector2(4, 4);
const raycaster = new THREE.Raycaster();
const interactive = [];
const chapters = [...document.querySelectorAll('.chapter')];
const railButtons = [...document.querySelectorAll('.rail button')];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reducedMotion) document.body.classList.add('reduced-motion');

const palettes = {
  cream: new THREE.MeshStandardMaterial({ color: 0xd7d0bc, roughness: .74, metalness: .02 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x24262b, roughness: .62, metalness: .12 }),
  black: new THREE.MeshStandardMaterial({ color: 0x0b0c0e, roughness: .48, metalness: .1 }),
  chrome: new THREE.MeshStandardMaterial({ color: 0x9da3a4, roughness: .28, metalness: .82 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0x101821, roughness: .16, metalness: .04, transmission: .08, clearcoat: .8, clearcoatRoughness: .18 }),
  orange: new THREE.MeshStandardMaterial({ color: 0xff663d, roughness: .48, metalness: .05 }),
  blue: new THREE.MeshStandardMaterial({ color: 0x5b87d6, roughness: .5, metalness: .05 }),
  red: new THREE.MeshStandardMaterial({ color: 0xff4f45, roughness: .46, metalness: .03 }),
  white: new THREE.MeshStandardMaterial({ color: 0xeee9dc, roughness: .68, metalness: 0 }),
};

const hemi = new THREE.HemisphereLight(0xe9efff, 0x1c1410, 2.3);
scene.add(hemi);
const key = new THREE.DirectionalLight(0xffe5c4, 5.4);
key.position.set(-4.4, 7.5, 5.3);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
key.shadow.camera.left = -7;
key.shadow.camera.right = 7;
key.shadow.camera.top = 7;
key.shadow.camera.bottom = -7;
scene.add(key);
const rim = new THREE.PointLight(0x7ca6ff, 20, 22, 2);
rim.position.set(5.5, 2.3, -2.5);
scene.add(rim);
const warm = new THREE.PointLight(0xff7046, 14, 17, 2);
warm.position.set(-5, -2, 1.5);
scene.add(warm);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(7.2, 80),
  new THREE.ShadowMaterial({ color: 0x000000, opacity: .34 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2.63;
floor.receiveShadow = true;
scene.add(floor);

const dustGeo = new THREE.BufferGeometry();
const dustCount = 500;
const dustPositions = new Float32Array(dustCount * 3);
for (let i = 0; i < dustCount; i++) {
  dustPositions[i * 3] = (Math.random() - .5) * 16;
  dustPositions[i * 3 + 1] = (Math.random() - .5) * 10;
  dustPositions[i * 3 + 2] = (Math.random() - .5) * 10;
}
dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xffffff, size: .013, transparent: true, opacity: .28, depthWrite: false }));
scene.add(dust);

function roundedRectShape(w, h, radius) {
  const r = Math.min(radius, w * .5, h * .5);
  const x = -w * .5;
  const y = -h * .5;
  const shape = new THREE.Shape();
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

function rounded(w, h, d, radius, material) {
  const bevel = Math.min(radius * .28, d * .18, .08);
  const geometry = new THREE.ExtrudeGeometry(roundedRectShape(w, h, radius), {
    depth: Math.max(.001, d - bevel * 2),
    bevelEnabled: bevel > .001,
    bevelSegments: 3,
    steps: 1,
    bevelSize: bevel,
    bevelThickness: bevel,
    curveSegments: 8,
  });
  geometry.translate(0, 0, -d * .5 + bevel);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function box(w, h, d, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function cylinder(r, depth, material, segments = 48) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, depth, segments), material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export { THREE, canvas, renderer, scene, camera, clock, pointer, raycaster, interactive, chapters, railButtons, reducedMotion, palettes, dust, rounded, box, cylinder };

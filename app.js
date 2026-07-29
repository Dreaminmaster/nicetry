import {
  THREE, renderer, scene, camera, clock, pointer, raycaster, interactive,
  chapters, railButtons, reducedMotion, palettes, dust, rounded, box, cylinder
} from './scene.js';
import { makeScreenTexture } from './textures.js';

const root = new THREE.Group();
scene.add(root);

const models = [];
let activeIndex = 0;
let dragActive = false;
let moved = false;
let lastX = 0;
let lastY = 0;
let targetRotationY = 0.2;
let targetRotationX = -0.05;
let scrollLean = 0;
let lastScrollY = window.scrollY;

const currentIndex = document.querySelector('#currentIndex');
const boot = document.querySelector('#boot');

function cloneMaterial(material, overrides = {}) {
  const copy = material.clone();
  Object.assign(copy, overrides);
  return copy;
}

function markInteractive(mesh, handler) {
  mesh.userData.onActivate = handler;
  interactive.push(mesh);
  return mesh;
}

function add(group, object, position = [0, 0, 0], rotation = [0, 0, 0]) {
  object.position.set(...position);
  object.rotation.set(...rotation);
  group.add(object);
  return object;
}

function makeMac() {
  const group = new THREE.Group();
  group.name = 'Macintosh';

  const body = add(group, rounded(3.35, 4.2, 2.55, .22, palettes.cream));
  body.scale.z = .94;
  const lowerMaterial = cloneMaterial(palettes.cream);
  lowerMaterial.color.set(0xcac1aa);
  const lower = add(group, rounded(3.05, .9, 2.35, .16, lowerMaterial), [0, -1.53, .02]);
  lower.rotation.x = .02;

  add(group, rounded(2.45, 1.85, .22, .12, palettes.black), [0, .52, 1.24]);
  const screenMaterial = new THREE.MeshBasicMaterial({ map: makeScreenTexture('mac', 0), toneMapped: false });
  const screen = add(group, new THREE.Mesh(new THREE.PlaneGeometry(2.18, 1.55), screenMaterial), [0, .52, 1.37]);
  screen.userData.variant = 0;
  markInteractive(screen, () => {
    screen.userData.variant += 1;
    screen.material.map.dispose();
    screen.material.map = makeScreenTexture('mac', screen.userData.variant);
    screen.material.needsUpdate = true;
    group.userData.bump = 1;
  });

  add(group, rounded(1.32, .13, .08, .035, palettes.black), [.48, -.75, 1.3]);
  add(group, cylinder(.07, .05, palettes.black, 24), [-1.18, -1.02, 1.31], [Math.PI / 2, 0, 0]);
  const stand = add(group, rounded(1.52, .26, 1.35, .1, palettes.cream), [0, -2.24, -.02]);
  stand.rotation.x = -.04;

  const mouse = add(group, rounded(.74, .33, 1.02, .18, palettes.cream), [2.25, -2.1, .62], [0, -.32, 0]);
  const mouseLine = new THREE.CatmullRomCurve3([
    new THREE.Vector3(1.92, -2.06, .52),
    new THREE.Vector3(1.42, -2.12, .82),
    new THREE.Vector3(.9, -2.14, .45),
  ]);
  group.add(new THREE.Mesh(new THREE.TubeGeometry(mouseLine, 28, .018, 7, false), palettes.dark));

  group.userData.update = (time, dt) => {
    const bump = group.userData.bump || 0;
    group.userData.bump = Math.max(0, bump - dt * 4);
    group.rotation.z = Math.sin(time * .8) * .006 + group.userData.bump * .018;
    mouse.rotation.y = -.32 + Math.sin(time * 1.15) * .045;
  };
  return group;
}

function makeTape() {
  const group = new THREE.Group();
  group.name = 'Cassette Player';

  add(group, rounded(4.5, 2.75, 1.15, .18, palettes.dark));
  add(group, rounded(4.16, 2.38, .2, .12, palettes.orange), [0, 0, .57]);
  const innerMaterial = cloneMaterial(palettes.black);
  innerMaterial.color.set(0x15171c);
  add(group, rounded(3.72, 1.96, .18, .12, innerMaterial), [0, .03, .7]);

  const windowMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xa8c2d1, transparent: true, opacity: .38, roughness: .16,
    transmission: .18, clearcoat: 1, clearcoatRoughness: .1
  });
  const windowMesh = add(group, rounded(2.78, 1.13, .1, .08, windowMaterial), [0, .18, .82]);

  const reelMaterial = cloneMaterial(palettes.white);
  reelMaterial.color.set(0xe8e5da);
  const reelA = add(group, cylinder(.45, .15, reelMaterial, 44), [-.82, .18, .85], [Math.PI / 2, 0, 0]);
  const reelB = add(group, cylinder(.45, .15, reelMaterial, 44), [.82, .18, .85], [Math.PI / 2, 0, 0]);
  const hubA = add(group, cylinder(.16, .19, palettes.black, 24), [-.82, .18, .94], [Math.PI / 2, 0, 0]);
  const hubB = add(group, cylinder(.16, .19, palettes.black, 24), [.82, .18, .94], [Math.PI / 2, 0, 0]);
  const tapeBand = add(group, box(1.3, .09, .03, palettes.black), [0, .18, .96]);

  add(group, rounded(2.95, .58, .04, .04, palettes.white), [0, -.68, .85]);
  add(group, box(2.45, .065, .035, palettes.black), [0, -.58, .89]);
  add(group, rounded(3.3, .4, .42, .08, palettes.black), [0, -1.58, .18]);

  const buttons = [];
  for (let i = 0; i < 5; i++) {
    const button = add(group, rounded(.48, .16, .3, .04, i === 2 ? palettes.white : palettes.chrome), [-.96 + i * .48, -1.38, .46]);
    buttons.push(button);
  }

  group.userData.playing = false;
  markInteractive(windowMesh, () => {
    group.userData.playing = !group.userData.playing;
    buttons[2].position.y = group.userData.playing ? -1.43 : -1.38;
    group.userData.bump = 1;
  });

  group.userData.update = (time, dt) => {
    const speed = group.userData.playing ? 4.8 : .25;
    reelA.rotation.y += dt * speed;
    reelB.rotation.y -= dt * speed * .92;
    hubA.rotation.y = reelA.rotation.y;
    hubB.rotation.y = reelB.rotation.y;
    tapeBand.scale.x = 1 + Math.sin(time * 3.2) * .012;
    const bump = group.userData.bump || 0;
    group.userData.bump = Math.max(0, bump - dt * 5);
    group.position.y = group.userData.baseY + group.userData.bump * .08;
  };
  return group;
}

function makeCamera() {
  const group = new THREE.Group();
  group.name = 'Instant Camera';

  add(group, rounded(4.05, 3.1, 2.0, .2, palettes.white));
  add(group, rounded(3.82, .34, .12, .07, palettes.orange), [0, .88, 1.02]);
  add(group, rounded(3.82, .19, .13, .05, palettes.blue), [0, .55, 1.03]);

  add(group, cylinder(.88, .42, palettes.black, 56), [0, .05, 1.09], [Math.PI / 2, 0, 0]);
  const lensGlass = add(group, cylinder(.57, .12, palettes.glass, 56), [0, .05, 1.36], [Math.PI / 2, 0, 0]);
  const innerLensMaterial = cloneMaterial(palettes.glass);
  innerLensMaterial.color.set(0x446485);
  add(group, cylinder(.26, .07, innerLensMaterial, 48), [0, .05, 1.45], [Math.PI / 2, 0, 0]);

  const flashMaterial = cloneMaterial(palettes.white);
  flashMaterial.emissive.set(0xffeab7);
  flashMaterial.emissiveIntensity = .2;
  const flash = add(group, rounded(.62, .46, .1, .07, flashMaterial), [1.25, .73, 1.04]);
  add(group, rounded(.56, .41, .1, .06, palettes.black), [-1.22, .72, 1.04]);
  add(group, rounded(2.65, .18, .12, .045, palettes.black), [0, -1.07, 1.02]);

  const photoFrame = add(group, rounded(1.95, 2.18, .045, .025, palettes.white), [0, -1.64, .94]);
  const photoMaterial = new THREE.MeshBasicMaterial({ map: makeScreenTexture('photo', 0), toneMapped: false, transparent: true, opacity: 0 });
  const photo = add(group, new THREE.Mesh(new THREE.PlaneGeometry(1.68, 1.46), photoMaterial), [0, -1.49, .975]);
  photoFrame.visible = false;
  photo.visible = false;

  const flashLight = new THREE.PointLight(0xffffff, 0, 8, 2);
  flashLight.position.set(1.25, .72, 2.2);
  group.add(flashLight);

  group.userData.eject = 0;
  group.userData.flash = 0;
  group.userData.hold = 0;

  markInteractive(lensGlass, () => {
    if (group.userData.eject > 0 && group.userData.eject < 1) return;
    group.userData.eject = .001;
    group.userData.flash = 1;
    group.userData.hold = 0;
    photoFrame.visible = true;
    photo.visible = true;
    photo.material.opacity = 0;
    photo.position.y = -1.49;
    photoFrame.position.y = -1.64;
  });

  group.userData.update = (time, dt) => {
    if (group.userData.flash > 0) {
      group.userData.flash = Math.max(0, group.userData.flash - dt * 5.5);
      flashLight.intensity = group.userData.flash * 80;
      flash.material.emissiveIntensity = .2 + group.userData.flash * 6;
      group.scale.setScalar(1 + group.userData.flash * .012);
    } else {
      flashLight.intensity = 0;
      flash.material.emissiveIntensity = .2;
      group.scale.setScalar(1);
    }

    if (group.userData.eject > 0 && group.userData.eject < 1) {
      group.userData.eject = Math.min(1, group.userData.eject + dt * .52);
      const eased = 1 - Math.pow(1 - group.userData.eject, 3);
      photo.position.y = -1.49 - eased * 1.45;
      photoFrame.position.y = -1.64 - eased * 1.45;
      photo.material.opacity = Math.min(1, Math.max(0, group.userData.eject * 1.35 - .18));
    } else if (group.userData.eject === 1) {
      group.userData.hold += dt;
      if (group.userData.hold > 2.6) {
        group.userData.eject = 0;
        photoFrame.visible = false;
        photo.visible = false;
      }
    }
  };
  return group;
}

function makeTV() {
  const group = new THREE.Group();
  group.name = 'CRT Television';

  const wood = new THREE.MeshStandardMaterial({ color: 0x8a5738, roughness: .8, metalness: .03 });
  add(group, rounded(4.5, 3.45, 2.35, .23, wood));
  add(group, rounded(3.15, 2.35, .18, .16, palettes.black), [-.32, .22, 1.17]);

  const screenMaterial = new THREE.MeshBasicMaterial({ map: makeScreenTexture('tv', 0), toneMapped: false });
  const screen = add(group, new THREE.Mesh(new THREE.PlaneGeometry(2.72, 1.87), screenMaterial), [-.32, .22, 1.29]);
  screen.userData.channel = 0;
  markInteractive(screen, () => {
    screen.userData.channel += 1;
    screen.material.map.dispose();
    screen.material.map = makeScreenTexture('tv', screen.userData.channel);
    screen.material.needsUpdate = true;
    group.userData.tune = 1;
  });

  const panelMaterial = cloneMaterial(palettes.cream);
  panelMaterial.color.set(0xcdbb98);
  add(group, rounded(.82, 2.43, .16, .09, panelMaterial), [1.62, .12, 1.17]);
  for (let i = 0; i < 5; i++) add(group, cylinder(.14, .11, palettes.black, 28), [1.62, .82 - i * .36, 1.34], [Math.PI / 2, 0, 0]);
  for (let i = 0; i < 7; i++) add(group, box(.48, .04, .05, palettes.black), [1.62, -1.0 + i * .095, 1.29]);

  const antennaL = add(group, cylinder(.035, 2.25, palettes.chrome, 12), [-.58, 2.45, -.05], [0, 0, -.34]);
  const antennaR = add(group, cylinder(.035, 2.25, palettes.chrome, 12), [.12, 2.45, -.05], [0, 0, .34]);

  group.userData.tune = 0;
  group.userData.update = (time, dt) => {
    group.userData.tune = Math.max(0, group.userData.tune - dt * 3.5);
    group.rotation.z = Math.sin(time * .58) * .005 + Math.sin(time * 45) * group.userData.tune * .006;
    antennaL.rotation.y = Math.sin(time * .65) * .035;
    antennaR.rotation.y = -Math.sin(time * .65) * .035;
  };
  return group;
}

models.push(makeMac(), makeTape(), makeCamera(), makeTV());
models.forEach((model, index) => {
  model.visible = index === 0;
  model.userData.baseY = index === 1 ? .12 : 0;
  model.position.y = model.userData.baseY;
  root.add(model);
});

function setActive(index, scrollTo = false) {
  if (!Number.isFinite(index) || index < 0 || index >= models.length) return;
  activeIndex = index;
  models.forEach((model, i) => { model.visible = i === index; });
  railButtons.forEach((button, i) => button.setAttribute('aria-current', i === index ? 'true' : 'false'));
  if (currentIndex) currentIndex.textContent = String(index + 1).padStart(2, '0');
  targetRotationY = [.18, -.22, .12, -.16][index];
  targetRotationX = [-.04, .02, -.06, .01][index];
  if (scrollTo) chapters[index]?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
}

railButtons.forEach((button, index) => button.addEventListener('click', () => setActive(index, true)));

const observer = new IntersectionObserver(entries => {
  const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (visible) setActive(Number(visible.target.dataset.scene));
}, { threshold: [0.35, 0.55, 0.75] });
chapters.forEach(chapter => observer.observe(chapter));

function updatePointer(x, y) {
  pointer.x = x / window.innerWidth * 2 - 1;
  pointer.y = -(y / window.innerHeight) * 2 + 1;
}

function activateAt(x, y) {
  updatePointer(x, y);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(interactive, false)[0];
  hit?.object?.userData?.onActivate?.();
}

const canvas = renderer.domElement;
canvas.addEventListener('pointerdown', event => {
  dragActive = true;
  moved = false;
  lastX = event.clientX;
  lastY = event.clientY;
  canvas.setPointerCapture?.(event.pointerId);
});
canvas.addEventListener('pointermove', event => {
  if (!dragActive) return;
  const dx = event.clientX - lastX;
  const dy = event.clientY - lastY;
  if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
  targetRotationY += dx * .006;
  targetRotationX = THREE.MathUtils.clamp(targetRotationX + dy * .003, -.35, .35);
  lastX = event.clientX;
  lastY = event.clientY;
});
canvas.addEventListener('pointerup', event => {
  if (!moved) activateAt(event.clientX, event.clientY);
  dragActive = false;
  canvas.releasePointerCapture?.(event.pointerId);
});
canvas.addEventListener('pointercancel', () => { dragActive = false; });

window.addEventListener('scroll', () => {
  const now = window.scrollY;
  scrollLean = THREE.MathUtils.clamp((now - lastScrollY) * .0015, -.12, .12);
  lastScrollY = now;
}, { passive: true });

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
}
window.addEventListener('resize', resize);

let elapsed = 0;
function animate() {
  const dt = Math.min(clock.getDelta(), .05);
  elapsed += dt;
  root.rotation.y += (targetRotationY - root.rotation.y) * Math.min(1, dt * 3.8);
  root.rotation.x += (targetRotationX + scrollLean - root.rotation.x) * Math.min(1, dt * 3.2);
  scrollLean *= .92;

  const model = models[activeIndex];
  if (model) {
    const bob = reducedMotion ? 0 : Math.sin(elapsed * .72) * .075;
    model.position.y = (model.userData.baseY || 0) + bob;
    model.userData.update?.(elapsed, dt);
  }

  dust.rotation.y += dt * .012;
  dust.rotation.x = Math.sin(elapsed * .11) * .025;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

setActive(0);
window.setTimeout(() => boot?.classList.add('done'), reducedMotion ? 80 : 1100);

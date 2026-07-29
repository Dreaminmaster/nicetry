import { THREE, camera, reducedMotion } from './scene.js';

const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
const supportsOrientation = 'DeviceOrientationEvent' in window;
const basePosition = new THREE.Vector3(0, 0.25, 9.3);
const currentPosition = basePosition.clone();
const targetPosition = basePosition.clone();
const currentLook = new THREE.Vector3(0, 0, 0);
const targetLook = new THREE.Vector3(0, 0, 0);

let enabled = false;
let baselineBeta = null;
let baselineGamma = null;
let lastTouchX = window.innerWidth * 0.5;
let lastTouchY = window.innerHeight * 0.5;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function screenAngle() {
  const value = window.screen?.orientation?.angle;
  if (Number.isFinite(value)) return value;
  return Number(window.orientation) || 0;
}

function normalizeTilt(beta, gamma) {
  if (baselineBeta === null || baselineGamma === null) {
    baselineBeta = beta;
    baselineGamma = gamma;
  }

  const betaDelta = beta - baselineBeta;
  const gammaDelta = gamma - baselineGamma;
  const angle = ((screenAngle() % 360) + 360) % 360;

  if (angle === 90) return { horizontal: betaDelta, vertical: -gammaDelta };
  if (angle === 270) return { horizontal: -betaDelta, vertical: gammaDelta };
  if (angle === 180) return { horizontal: -gammaDelta, vertical: -betaDelta };
  return { horizontal: gammaDelta, vertical: betaDelta };
}

function handleOrientation(event) {
  if (!enabled || !Number.isFinite(event.beta) || !Number.isFinite(event.gamma)) return;

  const tilt = normalizeTilt(event.beta, event.gamma);
  const horizontal = clamp(tilt.horizontal, -24, 24) / 24;
  const vertical = clamp(tilt.vertical, -20, 20) / 20;
  const depth = Math.min(1, Math.hypot(horizontal, vertical));

  targetPosition.set(
    horizontal * 0.82,
    0.25 - vertical * 0.56,
    9.3 - depth * 0.18,
  );
  targetLook.set(horizontal * 0.42, -vertical * 0.3, 0);
}

function touchFallback(event) {
  if (!coarsePointer || enabled || !event.touches?.length) return;
  lastTouchX = event.touches[0].clientX;
  lastTouchY = event.touches[0].clientY;
  const horizontal = clamp((lastTouchX / window.innerWidth - 0.5) * 2, -1, 1);
  const vertical = clamp((lastTouchY / window.innerHeight - 0.5) * 2, -1, 1);
  targetPosition.set(horizontal * 0.34, 0.25 - vertical * 0.2, 9.3);
  targetLook.set(horizontal * 0.16, -vertical * 0.12, 0);
}

function resetMotionBaseline() {
  baselineBeta = null;
  baselineGamma = null;
}

function startOrientation() {
  enabled = true;
  resetMotionBaseline();
  window.addEventListener('deviceorientation', handleOrientation, { passive: true });
  window.addEventListener('orientationchange', resetMotionBaseline, { passive: true });
}

async function requestOrientationPermission() {
  try {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      const result = await DeviceOrientationEvent.requestPermission();
      if (result !== 'granted') return false;
    }
    startOrientation();
    return true;
  } catch (error) {
    console.warn('Motion permission was not granted.', error);
    return false;
  }
}

function installMotionControl() {
  if (!coarsePointer || reducedMotion || !supportsOrientation) return;

  const style = document.createElement('style');
  style.textContent = `
    .motion-toggle {
      position: fixed;
      z-index: 14;
      right: max(14px, env(safe-area-inset-right));
      bottom: max(58px, calc(env(safe-area-inset-bottom) + 48px));
      min-height: 42px;
      padding: 0 15px;
      border: 1px solid rgba(255,255,255,.22);
      border-radius: 999px;
      background: rgba(10,11,15,.72);
      color: #fff;
      box-shadow: 0 12px 34px rgba(0,0,0,.34);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      font: 600 12px/1 ui-sans-serif, -apple-system, BlinkMacSystemFont, sans-serif;
      letter-spacing: .06em;
      cursor: pointer;
      transition: opacity .3s ease, transform .3s ease, background .3s ease;
    }
    .motion-toggle:active { transform: scale(.96); }
    .motion-toggle.active { background: rgba(91,135,214,.82); }
    .motion-toggle.dismissed { opacity: 0; pointer-events: none; transform: translateY(8px); }
  `;
  document.head.appendChild(style);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'motion-toggle';
  button.textContent = '开启手机视差';
  button.setAttribute('aria-label', '开启手机陀螺仪视差');
  document.body.appendChild(button);

  button.addEventListener('click', async () => {
    button.disabled = true;
    button.textContent = '正在开启…';
    const granted = await requestOrientationPermission();
    button.disabled = false;

    if (granted) {
      button.classList.add('active');
      button.textContent = '手机视差已开启';
      window.setTimeout(() => button.classList.add('dismissed'), 1500);
    } else {
      button.textContent = '未获得动作权限';
      window.setTimeout(() => { button.textContent = '重新开启手机视差'; }, 1800);
    }
  });

  // Android and some browsers expose motion without an explicit permission prompt.
  if (typeof DeviceOrientationEvent.requestPermission !== 'function') {
    startOrientation();
    button.classList.add('active');
    button.textContent = '手机视差已开启';
    window.setTimeout(() => button.classList.add('dismissed'), 1300);
  }
}

window.addEventListener('touchmove', touchFallback, { passive: true });
window.addEventListener('touchend', () => {
  if (!enabled) {
    targetPosition.copy(basePosition);
    targetLook.set(0, 0, 0);
  }
}, { passive: true });

function animateMobileParallax() {
  const response = enabled ? 0.075 : 0.055;
  currentPosition.lerp(targetPosition, response);
  currentLook.lerp(targetLook, response);
  camera.position.copy(currentPosition);
  camera.lookAt(currentLook);
  requestAnimationFrame(animateMobileParallax);
}

installMotionControl();
animateMobileParallax();

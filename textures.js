import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js';
import { renderer } from './scene.js';

export function makeScreenTexture(kind = 'mac', variant = 0) {
  const c = document.createElement('canvas');
  c.width = 768;
  c.height = 512;
  const x = c.getContext('2d');
  const seed = performance.now() * .001;

  if (kind === 'mac') {
    const schemes = [
      ['#d9ddd2', '#111', '#6796cb'],
      ['#f0d967', '#171717', '#ff7148'],
      ['#8fc7b5', '#10221d', '#e8f3e9'],
    ];
    const [bg, fg, accent] = schemes[variant % schemes.length];
    x.fillStyle = bg; x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = fg; x.fillRect(0, 0, c.width, 42);
    x.font = 'bold 17px monospace'; x.fillStyle = bg; x.fillText('●  NICE OS   File   Edit   View   Object', 20, 27);
    x.fillStyle = '#f7f7f2'; x.fillRect(56, 82, 410, 330);
    x.strokeStyle = fg; x.lineWidth = 5; x.strokeRect(56, 82, 410, 330);
    x.fillStyle = accent; x.fillRect(58, 84, 406, 44);
    x.fillStyle = fg; x.font = 'bold 24px monospace'; x.fillText('OBJECT ARCHIVE', 82, 114);
    x.font = 'bold 72px sans-serif'; x.fillText(['HELLO', 'PLAY', 'CLICK'][variant % 3], 90, 230);
    x.font = '18px monospace'; x.fillText('A tactile website made in code.', 91, 278);
    x.fillText('Drag • scroll • tap', 91, 310);
    for (let i = 0; i < 6; i++) {
      x.fillStyle = i === variant % 6 ? accent : fg;
      x.fillRect(92 + i * 48, 347, 28, 28);
    }
    x.fillStyle = fg; x.fillRect(530, 90, 160, 120);
    x.fillStyle = bg; x.font = 'bold 26px monospace'; x.fillText('01', 588, 158);
    x.strokeStyle = fg; x.lineWidth = 4; x.strokeRect(530, 242, 160, 170);
    x.font = '16px monospace'; x.fillStyle = fg;
    x.fillText('STATUS', 553, 278); x.fillText('ONLINE', 553, 307); x.fillText('WEBGL', 553, 336); x.fillText('1984→∞', 553, 365);
  }

  if (kind === 'photo') {
    const g = x.createLinearGradient(0, 0, 768, 512);
    g.addColorStop(0, '#82b5d9'); g.addColorStop(.46, '#f2c38b'); g.addColorStop(1, '#d65449');
    x.fillStyle = g; x.fillRect(0, 0, 768, 512);
    x.fillStyle = 'rgba(29,29,32,.86)'; x.fillRect(0, 340, 768, 172);
    x.fillStyle = '#131619';
    x.beginPath(); x.moveTo(0, 375); x.lineTo(120, 265); x.lineTo(230, 375); x.lineTo(355, 215); x.lineTo(530, 375); x.lineTo(640, 285); x.lineTo(768, 370); x.lineTo(768, 512); x.lineTo(0, 512); x.closePath(); x.fill();
    x.fillStyle = '#f6e5b7'; x.beginPath(); x.arc(610, 120, 60, 0, Math.PI * 2); x.fill();
    x.fillStyle = 'rgba(255,255,255,.82)'; x.font = 'bold 28px monospace'; x.fillText('ONE FRAME / NO UNDO', 28, 470);
  }

  if (kind === 'tv') {
    x.fillStyle = '#111'; x.fillRect(0, 0, 768, 512);
    const mode = variant % 4;
    if (mode === 0) {
      const colors = ['#e8e7d8', '#e9dd30', '#2cc4c9', '#43bd50', '#c54cc9', '#e33c3c', '#395ad5'];
      colors.forEach((col, i) => { x.fillStyle = col; x.fillRect(i * 110, 0, 112, 350); });
      x.fillStyle = '#111'; x.fillRect(0, 350, 768, 162);
      x.fillStyle = '#efefef'; x.fillRect(0, 350, 110, 162); x.fillStyle = '#1a2a94'; x.fillRect(110, 350, 110, 162);
    } else if (mode === 1) {
      x.fillStyle = '#0b0d14'; x.fillRect(0, 0, 768, 512);
      for (let i = 0; i < 130; i++) {
        x.fillStyle = `hsla(${(i * 17) % 360}, 80%, 65%, .75)`;
        const yy = (i * 39 + seed * 34) % 512;
        x.fillRect(0, yy, 768, 2 + (i % 5));
      }
      x.fillStyle = '#fff'; x.font = 'bold 72px monospace'; x.fillText('CH 04', 230, 280);
    } else if (mode === 2) {
      const grd = x.createRadialGradient(384, 256, 10, 384, 256, 420);
      grd.addColorStop(0, '#f8eb8d'); grd.addColorStop(.4, '#fa6d46'); grd.addColorStop(1, '#3c1f67');
      x.fillStyle = grd; x.fillRect(0, 0, 768, 512);
      x.fillStyle = 'rgba(10,10,14,.82)';
      for (let i = 0; i < 11; i++) x.fillRect(i * 78 - 40, 0, 22, 512);
      x.fillStyle = '#fff'; x.font = 'bold 38px monospace'; x.fillText('PLEASE STAND BY', 190, 275);
    } else {
      const data = x.createImageData(768, 512);
      for (let i = 0; i < data.data.length; i += 4) {
        const v = Math.random() * 255;
        data.data[i] = v; data.data[i + 1] = v; data.data[i + 2] = v; data.data[i + 3] = 255;
      }
      x.putImageData(data, 0, 0);
    }
    x.globalAlpha = .12; x.fillStyle = '#fff';
    for (let yy = 0; yy < 512; yy += 4) x.fillRect(0, yy, 768, 1);
    x.globalAlpha = 1;
  }

  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
  texture.needsUpdate = true;
  texture.userData.canvas = c;
  texture.userData.context = x;
  return texture;
}

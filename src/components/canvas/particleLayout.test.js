import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { LOGO_SHAPES } from '../BrandLogo/logoShapes.js';
import { particleLayout } from './particleLayout.js';

const logo = LOGO_SHAPES.flat().map(([x, y]) => new THREE.Vector3(x * 1.85, y * 1.85, .15));
const bounds = {
  width: Math.max(...logo.map((point) => Math.abs(point.x))) * 2,
  height: Math.max(...logo.map((point) => Math.abs(point.y))) * 2,
  diameter: Math.max(...logo.map((point) => point.length())) * 2,
};

test('the complete MC outline stays inside portrait, landscape and tablet viewports while swaying', () => {
  for (const [width, height] of [[320, 568], [390, 844], [844, 390], [768, 1024], [900, 600]]) {
    const camera = new THREE.PerspectiveCamera(50, width / height, .1, 100);
    camera.position.z = 9;
    camera.updateMatrixWorld();
    const layout = particleLayout({ width, height, fov: 50, distance: 9, shape: 0, bounds });
    for (const yaw of [-.46, 0, .46]) {
      for (const pitch of [-.125, .125]) {
        for (const vertex of logo) {
          const projected = vertex.clone().multiplyScalar(layout.scale)
            .applyEuler(new THREE.Euler(pitch, yaw, 0))
            .add(new THREE.Vector3(layout.x, layout.y, 0)).project(camera);
          assert.ok(Math.abs(projected.x) < .95 && Math.abs(projected.y) < .95,
            `MC outline clipped at ${width}×${height}`);
        }
      }
    }
  }
});

test('resizing back to desktop restores full scale and the right-hand composition', () => {
  const phone = particleLayout({ width: 390, height: 844, fov: 50, distance: 9, shape: 0, bounds });
  const desktop = particleLayout({ width: 1440, height: 900, fov: 50, distance: 9, shape: 0, bounds });
  assert.ok(phone.scale < 1);
  assert.equal(phone.x, 0);
  assert.equal(desktop.compact, false);
  assert.equal(desktop.scale, 1);
  assert.ok(desktop.x > 0);
});

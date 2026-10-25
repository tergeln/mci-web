import test from 'node:test';
import assert from 'node:assert/strict';
import getChatViewport from './chatViewport.js';

const viewport = { layoutHeight: 844, fullHeight: 844, height: 844, offsetTop: 0, scale: 1, inputFocused: true };

test('normal viewport and browser toolbar changes keep the floating panel', () => {
  assert.deepEqual(getChatViewport(viewport), { height: 844, bottom: 0, keyboardOpen: false });
  assert.equal(getChatViewport({ ...viewport, height: 780 }).keyboardOpen, false);
});

test('keyboard offset accounts for the visual viewport scrolling upwards', () => {
  assert.deepEqual(getChatViewport({ ...viewport, height: 480, offsetTop: 80 }), {
    height: 480, bottom: 284, keyboardOpen: true,
  });
});

test('browsers resizing the layout viewport do not add keyboard height twice', () => {
  assert.deepEqual(getChatViewport({ ...viewport, layoutHeight: 480, height: 480 }), {
    height: 480, bottom: 0, keyboardOpen: true,
  });
});

test('zoom and unfocused inputs do not activate keyboard layout', () => {
  assert.equal(getChatViewport({ ...viewport, height: 422, scale: 2 }).keyboardOpen, false);
  assert.equal(getChatViewport({ ...viewport, height: 480, inputFocused: false }).keyboardOpen, false);
  assert.equal(getChatViewport({ ...viewport, offsetTop: 30 }).bottom, 0);
});

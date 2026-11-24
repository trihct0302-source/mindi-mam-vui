import { envelopes, spriteTrims } from './accessory-anchors.js';

const headwear = new Set(['bow', 'beanie', 'headphones']);
const companions = new Set(['teddy', 'star_lamp']);

export function accessoryAnchor(characterId, level, item, state = 'idle') {
  const [left, top, right, bottom] = envelopes[`${characterId}_lv${level}`][state];
  const width = right - left;
  const height = bottom - top;
  const center = (left + right) / 2;
  const side = right + Math.min(5, width * 0.1);
  let x = side;
  let y = top + height * 0.72;
  let size = width * 0.34;

  if (headwear.has(item)) {
    x = item === 'bow' ? center + width * 0.17 : center;
    y = top + height * (item === 'headphones' ? 0.28 : 0.10);
    size = width * (item === 'headphones' ? 0.68 : 0.42);
  } else if (item === 'sunglasses' || item === 'scarf') {
    x = center;
    y = top + height * (item === 'sunglasses' ? 0.46 : 0.72);
    size = width * 0.56;
  } else if (companions.has(item)) {
    y = bottom - height * 0.1;
    size = width * 0.38;
  }

  size = Math.max(13, Math.min(34, size));
  const half = size / 2;
  return [Math.min(100 - half, Math.max(half, x)), Math.min(100 - half, Math.max(half, y)), size];
}

export function positionAccessory(image, characterId, level, item, state = 'idle') {
  const [x, y, size] = accessoryAnchor(characterId, level, item, state);
  image.style.setProperty('--accessory-x', `${x}%`);
  image.style.setProperty('--accessory-y', `${y}%`);
  image.style.setProperty('--accessory-size', `${size}%`);
}

export function presentSprite(image, accessory, item) {
  const match = image.getAttribute('src')?.match(/(?:animations\/(idle|tap|energy|cheer|sleepy)|characters)\/([a-z]+)_lv([1-4])\.(?:gif|png)$/);
  if (!match) return;
  const [, animation, characterId, level] = match;
  const state = animation || 'portrait';
  const trim = spriteTrims[`${characterId}_lv${level}/${state}`];
  image.style.clipPath = trim ? `inset(${trim[0]}% 0 ${trim[1]}% 0)` : '';
  if (accessory && item) positionAccessory(accessory, characterId, level, item, state);
}

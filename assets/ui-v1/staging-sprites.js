import { MindiMotion } from './motion-system-v3.js';

const correctedIdle = new Set(['aquarius_lv2', 'aquarius_lv3', 'aquarius_lv4', 'capricorn_lv3', 'capricorn_lv4', 'leo_lv3', 'virgo_lv3', 'scorpio_lv3']);

export function spriteDirectory(characterId, level, kind) {
  const form = `${characterId}_lv${level}`;
  return form === 'aquarius_lv1' || (kind === 'idle' && correctedIdle.has(form)) ? 'qa-v151/' : '';
}

export class StagingMotion extends MindiMotion {
  asset(kind, context = {}) {
    const url = super.asset(kind, context);
    return url.replace(this.assetBase + '/', this.assetBase + '/' +
      spriteDirectory(context.characterId, Number(context.level), kind));
  }
}

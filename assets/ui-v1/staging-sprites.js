import { MindiMotion } from './motion-system-v3.js';

export class StagingMotion extends MindiMotion {
  asset(kind, context = {}) {
    const url = super.asset(kind, context);
    const level = Number(context.level);
    const useStagingSprite = context.characterId === 'aquarius' &&
      (level === 1 || (level === 4 && kind === 'idle'));
    return useStagingSprite ? url.replace(this.assetBase + '/', this.assetBase + '/qa-v151/') : url;
  }
}

/* MINDI Motion Gameplay Adapter V3
 * Bridge validated gameplay outcomes to visual animations.
 * The caller owns validation, game state, inventory and persistence.
 */
export function createMindiMotionAdapter(motion,{getState=()=>({characterId:'aries',level:1})}={}){
  const context=(extra={})=>({...getState(),...extra});
  return {
    careConfirmed(result){if(!result?.accepted)return false;motion.play('care.confirm',context());return true},
    rewardGranted(result){if(!result?.granted)return false;motion.play('reward.chest.open',context({itemId:result.itemId,itemEmoji:result.itemEmoji||'🎁'}));return true},
    evolutionCompleted(result){if(!result?.changed||!(result.toLevel>result.fromLevel))return false;motion.play('character.evolve',context({fromLevel:result.fromLevel,toLevel:result.toLevel}));return true},
    outfitEquipped(result){if(!result?.equipped)return false;motion.play('outfit.change',context({itemId:result.itemId}));return true},
    screenChanged(){motion.play('screen.transition',context());return true},
    loading(visible,label='Đang tải…'){motion.play(visible?'loading.show':'loading.hide',context({label}));return true},
    characterTapped(){motion.play('character.tap',context());return true}
  };
}

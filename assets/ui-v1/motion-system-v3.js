/* MINDI Motion System V3
 * Reusable event-driven animation controller. No game-state persistence.
 * API: const motion = new MindiMotion({root, characterEl, onEvent});
 * motion.play('reward.chest.open', {characterId:'aries', level:1, itemId:'flower'});
 */
const SIGN_IDS=['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];
const MOTION_ASSETS=['idle','sleepy','tap','cheer','energy'];
const clampLevel=n=>Math.max(1,Math.min(4,Number(n)||1));
const safeSign=s=>SIGN_IDS.includes(s)?s:'aries';
export class MindiMotion{
  constructor({root=document,characterEl=null,onEvent=()=>{},assetBase='../../assets'}={}){
    this.root=root;this.characterEl=characterEl||root.querySelector('[data-mindi-character]');this.onEvent=onEvent;
    this.assetBase=assetBase.replace(/\/$/,'');this.reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false;
    this.active=null;this.cleanup=[];this.dragPayload=null;this.bindInteractions();
  }
  asset(kind,ctx={}){const sign=safeSign(ctx.characterId),level=clampLevel(ctx.level);return `${this.assetBase}/animations/${kind}/${sign}_lv${level}.gif`}
  emit(name,detail={}){this.root.dispatchEvent(new CustomEvent('mindi:motion',{bubbles:true,detail:{name,...detail}}));this.onEvent(name,detail)}
  clear(){if(this.active?.timer)clearTimeout(this.active.timer);this.active=null;this.root.querySelectorAll('[data-motion-layer]').forEach(n=>n.remove());this.root.querySelectorAll('.mindi-motion-playing').forEach(n=>n.classList.remove('mindi-motion-playing'))}
  wait(ms){return new Promise(resolve=>{const id=setTimeout(resolve,this.reduced?0:ms);this.cleanup.push(()=>clearTimeout(id))})}
  async play(name,ctx={}){
    this.clear();const token={name,ctx};this.active=token;this.emit('start',{name,context:ctx});
    const finish=()=>{if(this.active!==token)return;this.clear();this.emit('complete',{name,context:ctx})};
    const setCharacter=(kind,duration=900)=>{if(!this.characterEl)return;this.characterEl.src=this.asset(kind,ctx);this.characterEl.classList.add('mindi-motion-playing');return duration};
    if(name==='character.idle'||name==='character.sleep'){setCharacter(name.endsWith('sleep')?'sleepy':'idle',0);this.emit('complete',{name,context:ctx});return}
    if(name==='character.tap'){setCharacter('tap',850);await this.wait(850);if(this.active===token){setCharacter('idle',0);finish()}return}
    if(name==='care.confirm'){setCharacter('energy',1200);this.layer('🌱','care-burst');await this.wait(1200);if(this.active===token){setCharacter('idle',0);finish()}return}
    if(name==='reward.chest.open'||name==='reward.item.reveal'){
      this.layer(name==='reward.chest.open'?'🎁':'✨','chest-layer');
      await this.wait(350);if(this.active!==token)return;
      const chest=this.root.querySelector('[data-motion-layer]');if(chest)chest.classList.add('is-open');
      await this.wait(500);if(this.active!==token)return;
      this.layer(ctx.itemEmoji||'🎀','item-reveal');
      await this.wait(950);finish();return;
    }
    if(name==='character.evolve'){
      const from=clampLevel(ctx.fromLevel||1),to=clampLevel(ctx.toLevel||from+1);
      if(to<=from){this.emit('blocked',{reason:'target-level-must-be-higher',context:ctx});finish();return}
      setCharacter('energy',1500);this.layer('✦','evolution-flash');
      await this.wait(650);if(this.active!==token)return;
      if(this.characterEl)this.characterEl.src=this.asset('cheer',{...ctx,level:to});
      this.layer(`LEVEL ${to}`,'evolution-label');
      await this.wait(1100);finish();return;
    }
    if(name==='outfit.change'){
      const target=ctx.outfitEl||this.root.querySelector('[data-mindi-outfit]');
      if(target){target.classList.remove('outfit-pop');void target.offsetWidth;target.classList.add('outfit-pop')}
      this.layer('🎀','outfit-sparkle');await this.wait(650);finish();return;
    }
    if(name==='screen.transition'){
      const screen=ctx.screenEl||this.root.querySelector('[data-mindi-screen]');
      if(screen){screen.classList.add('screen-exit');await this.wait(220);if(this.active!==token)return;screen.classList.remove('screen-exit');screen.classList.add('screen-enter')}
      await this.wait(320);if(screen)screen.classList.remove('screen-enter');finish();return;
    }
    if(name==='loading.show'){
      this.layer(ctx.label||'Đang tải…','loading-layer');this.emit('loading',{visible:true});return;
    }
    if(name==='loading.hide'){this.clear();this.emit('loading',{visible:false});return}
    if(name==='gesture.swipe'||name==='gesture.drag-drop'){this.layer(name==='gesture.swipe'?'➜':'✦','gesture-feedback');await this.wait(420);finish();return}
    this.emit('unsupported',{name});finish();
  }
  layer(content,cls){const el=document.createElement('div');el.dataset.motionLayer='';el.className='mindi-motion-layer '+cls;el.textContent=content;(this.root.querySelector('[data-mindi-motion-stage]')||this.root).append(el);return el}
  bindInteractions(){
    const on=(target,event,fn)=>{target?.addEventListener(event,fn);this.cleanup.push(()=>target?.removeEventListener(event,fn))};
    on(this.root,'click',e=>{const tap=e.target.closest('[data-motion-tap]');if(tap){const c=this.context(tap);this.play('character.tap',c)}});
    on(this.root,'touchstart',e=>{const node=e.target.closest('[data-motion-swipe]');if(node)this._touchStart={x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY,node}},{passive:true});
    on(this.root,'touchend',e=>{if(!this._touchStart)return;const dx=e.changedTouches[0].clientX-this._touchStart.x,dy=e.changedTouches[0].clientY-this._touchStart.y;if(Math.abs(dx)>35||Math.abs(dy)>35)this.play('gesture.swipe',{direction:Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up')});this._touchStart=null},{passive:true});
    on(this.root,'dragstart',e=>{const item=e.target.closest('[data-drag-item]');if(item){this.dragPayload=item.dataset.dragItem;e.dataTransfer?.setData('text/plain',this.dragPayload)}});
    on(this.root,'dragover',e=>{if(e.target.closest('[data-drop-target]'))e.preventDefault()});
    on(this.root,'drop',e=>{const target=e.target.closest('[data-drop-target]');if(target&&this.dragPayload){e.preventDefault();this.play('gesture.drag-drop',{itemId:this.dragPayload,target:target.dataset.dropTarget});this.emit('drop',{itemId:this.dragPayload,target:target.dataset.dropTarget});this.dragPayload=null}});
  }
  context(node){return {characterId:node.dataset.character||'aries',level:node.dataset.level||1}}
  destroy(){this.clear();this.cleanup.forEach(fn=>fn());this.cleanup=[]}
}
export {SIGN_IDS,MOTION_ASSETS};

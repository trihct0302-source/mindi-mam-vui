import { StagingMotion, spriteDirectory } from './assets/ui-v1/staging-sprites.js';
import { presentSprite } from './assets/ui-v1/accessory-placement.js';

const signs=[['aries','Bạch Dương'],['taurus','Kim Ngưu'],['gemini','Song Tử'],['cancer','Cự Giải'],['leo','Sư Tử'],['virgo','Xử Nữ'],['libra','Thiên Bình'],['scorpio','Bọ Cạp'],['sagittarius','Nhân Mã'],['capricorn','Ma Kết'],['aquarius','Bảo Bình'],['pisces','Song Ngư']];
const items=['bubble_tea','teddy','snack','mirror','lipstick','headphones','bow','beanie','book','coffee','hotpot','camera','flower','sunglasses','scarf','star_lamp'];
const names=['Trà sữa','Gấu bông','Snack','Gương','Son','Tai nghe','Nơ','Mũ len','Sách','Cà phê','Lẩu','Máy ảnh','Hoa','Kính','Khăn','Đèn sao'];
const sayings={morning:['Dậy thôi! Hôm nay mình làm một việc nhỏ trước nha!','Hôm nay không cần hoàn hảo, chỉ cần bắt đầu.'],noon:['Ăn trưa chưa? Nhớ nạp năng lượng đó!','Uống nước rồi mình tiếp tục nha.'],afternoon:['Bạn đã cố gắng nhiều rồi. Nghỉ mắt một chút nhé!','Còn chút nữa thôi, mình cổ vũ nè!'],night:['Hôm nay đủ rồi, nghỉ ngơi thôi!','Mình trông góc bàn, bạn đi ngủ nha.']};
const key='mindi-mamvui-v1';
const $ = id => document.getElementById(id);

function unique(values, valid) {
  return Array.isArray(values) ? [...new Set(values.filter(valid))] : [];
}
function isoDay(day) {
  if (typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  const date = new Date(day + 'T00:00:00Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === day;
}

function readProgress() {
  let saved;
  try { saved = JSON.parse(localStorage.getItem(key)); } catch { saved = null; }
  const state = saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
  state.sign = signs.some(([id]) => id === state.sign) ? state.sign : 'aries';
  state.days = unique(state.days, isoDay);
  state.rewards = unique(state.rewards, item => items.includes(item));
  state.rewardWeeks = unique(state.rewardWeeks, isoDay);
  state.equipped = state.rewards.includes(state.equipped) ? state.equipped : null;
  return state;
}

let s = readProgress();

async function updateProgress(change) {
  function commit() {
    const current = readProgress();
    const result = change(current);
    if (result === null) {
      s = current;
      return null;
    }
    localStorage.setItem(key, JSON.stringify(current));
    s = current;
    return result;
  }
  try {
    return navigator.locks ? await navigator.locks.request(key, commit) : commit();
  } catch {
    say('Chưa lưu được tiến trình. Hãy thử lại sau khi kiểm tra quyền lưu dữ liệu của trình duyệt.');
    return null;
  }
}

function vnDate(d=new Date()){let parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);let obj=Object.fromEntries(parts.filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));return `${obj.year}-${obj.month}-${obj.day}`}
function hourVN(){return Number(new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Ho_Chi_Minh',hour:'numeric',hourCycle:'h23'}).format(new Date()))}
function time(){let h=hourVN();return h<5||h>=19?'night':h<12?'morning':h<14?'noon':'afternoon'}
function level(state = s){const n=state.days.length;return n>=45?4:n>=21?3:n>=7?2:1}
const motion = new StagingMotion({root: $('game'), characterEl: $('character'), assetBase: 'assets'});

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
function applyMotionPreference() {
  actionId++;
  motion.clear();
  motion.reduced = reducedMotion.matches;
  motion.characterEl = reducedMotion.matches ? null : $('character');
  render();
}
reducedMotion.addEventListener('change', applyMotionPreference);

function restingSprite() {
  if (reducedMotion.matches) {
    const directory = spriteDirectory(s.sign, level(), 'portrait');
    return `assets/${directory}characters/${s.sign}_lv${level()}.png`;
  }
  return motion.asset(time() === 'night' ? 'sleepy' : 'idle', {characterId: s.sign, level: level()});
}

let actionId = 0;
let pendingCareMotion;
async function animate(effects) {
  const id = ++actionId;
  for (const [name, context] of effects) {
    if (id !== actionId) return;
    await motion.play(name, {characterId: s.sign, level: level(), ...context});
  }
  if (id === actionId) render();
}

const character = $('character');
const equippedImage = $('equipped');
function updateSpritePresentation() {
  presentSprite(character, equippedImage, s.equipped);
}
new MutationObserver(updateSpritePresentation).observe(character, {
  attributes: true,
  attributeFilter: ['src'],
});

function updateEquipped() {
  equippedImage.hidden = !s.equipped;
  if (s.equipped) {
    const source = `assets/props/${s.equipped}.png`;
    if (equippedImage.getAttribute('src') !== source) equippedImage.src = source;
  }
  updateSpritePresentation();
}

function say(txt){$('bubble').textContent=txt}
function react(){const a=sayings[time()];say(a[Math.floor(Math.random()*a.length)]);void animate([['character.tap']])}
function render(){let t=time();$('game').style.backgroundImage=`url(assets/backgrounds/${t}.png)`;if(!motion.active){let url=restingSprite();if(!$('character').src.endsWith(url))$('character').src=url;}updateEquipped();$('level').textContent=`${['Mầm mới','Mầm quen','Mầm lớn','Mầm trưởng thành'][level()-1]} · ${s.days.length} ngày bên nhau`;$('care').disabled=s.days.includes(vnDate());$('care').textContent=$('care').disabled?'✓ Đã chăm hôm nay · Hẹn mai nhé':'🌱 Chăm Mầm hôm nay ♡';
  renderWeek();
}
function renderWeek() {
  const today = vnDate();
  const monday = new Date(weekKey(today) + 'T12:00:00Z');
  const labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  $('week').innerHTML = labels.map((label, index) => {
    const date = new Date(monday);
    date.setUTCDate(monday.getUTCDate() + index);
    const iso = date.toISOString().slice(0, 10);
    const done = s.days.includes(iso);
    const rewardDay = index === 6;
    const status = done ? 'Đã chăm' : rewardDay ? 'Chưa chăm, ngày quà' : 'Chưa chăm';
    const marker = done ? '✓' : rewardDay ? '🎁' : '·';
    return `<li class="day${done ? ' done' : ''}"${iso === today ? ' aria-current="date"' : ''}>
      <time datetime="${iso}">${label}</time>
      <span class="day-marker" aria-hidden="true">${marker}</span>
      <span class="visually-hidden">${status}</span>
    </li>`;
  }).join('');
}
const dialog = $('modal');
const popupBody = $('modalBody');
let popupOpener;
dialog.querySelector('.close').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => {
  dialog.classList.remove('is-entering', 'sparkle-burst');
  (popupOpener?.disabled ? $('petControl') : popupOpener)?.focus();
  popupOpener = null;
});

function showPopup(title, body, {reward = false, opener = document.activeElement} = {}) {
  $('popup-title').textContent = title;
  popupBody.innerHTML = body;
  dialog.classList.toggle('sparkle-burst', reward);
  if (!dialog.open) {
    popupOpener = opener;
    dialog.classList.add('is-entering');
    dialog.showModal();
  }
}

function weekKey(today = vnDate()) {
  const date = new Date(today + 'T12:00:00Z');
  date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
  return date.toISOString().slice(0, 10);
}
function showItems(editable, opener) {
  const cards = items.map((item, index) => {
    const owned = s.rewards.includes(item);
    const equipped = s.equipped === item;
    const art = `<img class="mindi-sprite-art" src="assets/props/${item}.png" alt=""><span>${names[index]}</span>`;
    const status = equipped ? 'Đang trang bị' : owned ? 'Đã sở hữu' : 'Chưa mở khóa';
    return editable
      ? `<button type="button" class="mindi-slot${equipped ? ' selected' : ''}" data-equip="${item}" aria-pressed="${equipped}" ${owned ? '' : 'disabled'}>${art}<small>${status}</small></button>`
      : `<li class="mindi-slot${owned ? '' : ' locked'}">${art}<small>${status}</small></li>`;
  }).join('');
  const tag = editable ? 'div' : 'ul';
  showPopup(editable ? 'Tủ phụ kiện' : 'Bộ sưu tập',
    `<${tag} class="grid rc1-items">${cards}</${tag}>` +
    (editable ? `<button class="mindi-btn secondary" data-remove ${s.equipped ? '' : 'disabled'}>Tháo phụ kiện</button>` : ''), {opener});
}

popupBody.addEventListener('click', async event => {
  const button = event.target.closest('button');
  if (!button) return;
  const item = button.dataset.equip;
  if (item) {
    const equipped = await updateProgress(state => {
      if (!state.rewards.includes(item)) return null;
      state.equipped = item;
      return item;
    });
    if (!equipped) return;
    updateEquipped();
    if (dialog.open) {
      showItems(true);
      popupBody.querySelector(`[data-equip="${item}"]`).focus();
    }
    say('Món này đáng yêu quá! ♡');
    const careMotion = pendingCareMotion;
    const currentAction = actionId;
    if (careMotion) await careMotion;
    if (currentAction === actionId && s.equipped === item) {
      void animate([['outfit.change', {outfitEl: $('equipped')}]]);
    }
  } else if (button.hasAttribute('data-remove')) {
    const previous = await updateProgress(state => {
      const oldItem = state.equipped;
      state.equipped = null;
      return oldItem;
    });
    if (!previous) return;
    updateEquipped();
    if (dialog.open) {
      showItems(true);
      popupBody.querySelector(`[data-equip="${previous}"]`).focus();
    }
  }
});

for (const [id, name] of signs) $('zodiac').add(new Option(name, id));
$('zodiac').value = s.sign;
async function selectSign(sign) {
  const changed = await updateProgress(state => {
    state.sign = sign;
    return sign;
  });
  if (!changed) {
    $('zodiac').value = s.sign;
    return;
  }
  actionId++;
  motion.clear();
  render();
  say('Mình sẽ đồng hành với bạn!');
  return changed;
}
$('zodiac').addEventListener('change', event => void selectSign(event.currentTarget.value));

window.addEventListener('storage', event => {
  if (event.key !== key && event.key !== null) return;
  const previousSign = s.sign;
  const previousLevel = level();
  s = readProgress();
  $('zodiac').value = s.sign;
  if (s.sign !== previousSign || level() !== previousLevel) {
    actionId++;
    motion.clear();
  }
  render();
});

const petControl=$('petControl');
let touchStart=null;
let suppressTap=false;
petControl.addEventListener('pointerdown',event=>{
  touchStart=event.isPrimary?{id:event.pointerId,x:event.clientX,y:event.clientY}:null;
  suppressTap=false;
});
petControl.addEventListener('pointercancel',()=>{touchStart=null;});
petControl.addEventListener('pointerup',event=>{
  if(touchStart?.id!==event.pointerId)return;
  const dx=event.clientX-touchStart.x;
  const dy=event.clientY-touchStart.y;
  touchStart=null;
  if(Math.abs(dx)<36||Math.abs(dx)<=Math.abs(dy))return;
  suppressTap=true;
  const select=$('zodiac');
  select.selectedIndex=(select.selectedIndex+(dx<0?1:-1)+signs.length)%signs.length;
  void selectSign(select.value).then(changed => { if (changed) react(); });
});
petControl.onclick=event=>{
  if(!suppressTap||event.detail===0)react();
  suppressTap=false;
};
$('care').addEventListener('click', async () => {
  const result = await updateProgress(state => {
    const today = vnDate();
    if (state.days.includes(today)) return null;

    const fromLevel = level(state);
    const week = weekKey(today);
    state.days.push(today);
    const toLevel = level(state);
    const dayOfWeek = new Date(today + 'T12:00:00Z').getUTCDay();
    let reward;
    if (dayOfWeek === 0 && !state.rewardWeeks.includes(week)) {
      const available = items.filter(item => !state.rewards.includes(item));
      if (available.length) {
        reward = available[Math.floor(Math.random() * available.length)];
        state.rewards.push(reward);
        state.rewardWeeks.push(week);
      }
    }
    return {fromLevel, toLevel, dayOfWeek, reward};
  });
  if (!result) {
    render();
    return;
  }
  const {fromLevel, toLevel, dayOfWeek, reward} = result;
  render();
  say('Mình nhận được năng lượng rồi! Cảm ơn bạn ♡');

  const effects = [['care.confirm', {level: fromLevel}]];
  if (toLevel > fromLevel) effects.push(['character.evolve', {fromLevel, toLevel, level: fromLevel}]);
  if (reward) effects.push(['reward.chest.open']);
  const careMotion = animate(effects);
  pendingCareMotion = careMotion;
  void careMotion.finally(() => {
    if (pendingCareMotion === careMotion) pendingCareMotion = undefined;
  });

  if (reward) {
    const label = names[items.indexOf(reward)];
    showPopup('Quà cuối tuần!', `<img class="mindi-reward-art rc1-reward mindi-sprite-art" src="assets/props/${reward}.png" alt=""><p>Nhận được <strong>${label}</strong></p><button class="mindi-btn primary" data-equip="${reward}">Trang bị ngay</button>`, {reward: true, opener: $('care')});
  } else {
    const copy = dayOfWeek === 6
      ? 'Hãy quay lại chăm Mầm vào Chủ nhật để nhận quà cuối tuần.'
      : 'Hẹn gặp bạn ngày mai nhé ♡';
    showPopup('Mầm vui lên rồi!', `<p>Bạn đã chăm Mầm hôm nay.</p><p>${copy}</p>`, {opener: $('care')});
  }
});
$('wardrobe').addEventListener('click', () => showItems(true, $('wardrobe')));
$('collection').addEventListener('click', () => showItems(false, $('collection')));
$('info').addEventListener('click', () => {
  showPopup('Tiến trình',
    `<p>Đã chăm Mầm <strong>${s.days.length} ngày</strong></p><p>Cấp hiện tại <strong>${level()}</strong></p><p>Mầm lớn dần sau 7, 21 và 45 ngày chăm.</p><p class="small">Tiến trình được lưu trong trình duyệt này. Ngày mới bắt đầu lúc 00:00 giờ Việt Nam.</p>`, {opener: $('info')});
});
applyMotionPreference();
setInterval(render, 30000);

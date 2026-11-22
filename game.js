import { StagingMotion } from './assets/ui-v1/staging-sprites.js';

const signs=[['aries','Bạch Dương'],['taurus','Kim Ngưu'],['gemini','Song Tử'],['cancer','Cự Giải'],['leo','Sư Tử'],['virgo','Xử Nữ'],['libra','Thiên Bình'],['scorpio','Bọ Cạp'],['sagittarius','Nhân Mã'],['capricorn','Ma Kết'],['aquarius','Bảo Bình'],['pisces','Song Ngư']];
const items=['bubble_tea','teddy','snack','mirror','lipstick','headphones','bow','beanie','book','coffee','hotpot','camera','flower','sunglasses','scarf','star_lamp'];
const names=['Trà sữa','Gấu bông','Snack','Gương','Son','Tai nghe','Nơ','Mũ len','Sách','Cà phê','Lẩu','Máy ảnh','Hoa','Kính','Khăn','Đèn sao'];
const sayings={morning:['Dậy thôi! Hôm nay mình làm một việc nhỏ trước nha!','Hôm nay không cần hoàn hảo, chỉ cần bắt đầu.'],noon:['Ăn trưa chưa? Nhớ nạp năng lượng đó!','Uống nước rồi mình tiếp tục nha.'],afternoon:['Bạn đã cố gắng nhiều rồi. Nghỉ mắt một chút nhé!','Còn chút nữa thôi, mình cổ vũ nè!'],night:['Hôm nay đủ rồi, nghỉ ngơi thôi!','Mình trông góc bàn, bạn đi ngủ nha.']};
const key='mindi-mamvui-v1';
let s;try{s=JSON.parse(localStorage.getItem(key)||'null')}catch(e){s=null}
if(!s||typeof s!=='object')s={};
if(!signs.some(x=>x[0]===s.sign))s.sign='aries';
s.days=Array.isArray(s.days)?[...new Set(s.days.filter(x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)))]:[];
s.rewards=Array.isArray(s.rewards)?[...new Set(s.rewards.filter(x=>items.includes(x)))]:[];
if(!items.includes(s.equipped)||!s.rewards.includes(s.equipped))s.equipped=null; const $=id=>document.getElementById(id);
function vnDate(d=new Date()){let parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);let obj=Object.fromEntries(parts.filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));return `${obj.year}-${obj.month}-${obj.day}`}
function hourVN(){return Number(new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Ho_Chi_Minh',hour:'numeric',hourCycle:'h23'}).format(new Date()))}
function time(){let h=hourVN();return h<5||h>=19?'night':h<12?'morning':h<14?'noon':'afternoon'}
function level(){let n=s.days.length;return n>=45?4:n>=21?3:n>=7?2:1}
function save(){localStorage.setItem(key,JSON.stringify(s))}
const motion = new StagingMotion({root: $('game'), characterEl: $('character'), assetBase: 'assets'});

function restingSprite() {
  return motion.asset(time() === 'night' ? 'sleepy' : 'idle', {characterId: s.sign, level: level()});
}

let actionId = 0;
async function animate(effects) {
  const id = ++actionId;
  for (const [name, context] of effects) {
    if (id !== actionId) return;
    await motion.play(name, {characterId: s.sign, level: level(), ...context});
  }
  if (id === actionId) render();
}

function updateEquipped(){let el=$('equipped');el.hidden=!s.equipped;if(s.equipped)el.src=`assets/props/${s.equipped}.png`}

function say(txt){$('bubble').textContent=txt}
function react(){const a=sayings[time()];say(a[Math.floor(Math.random()*a.length)]);void animate([['character.tap']])}
function render(){let t=time();$('game').style.backgroundImage=`url(assets/backgrounds/${t}.png)`;if(!motion.active){let url=restingSprite();if(!$('character').src.endsWith(url))$('character').src=url;}updateEquipped();$('level').textContent=`${['Mầm mới','Mầm quen','Mầm lớn','Mầm trưởng thành'][level()-1]} · ${s.days.length} ngày bên nhau`;$('care').disabled=s.days.includes(vnDate());$('care').textContent=$('care').disabled?'✓ Đã chăm hôm nay · Hẹn mai nhé':'🌱 Chăm Mầm hôm nay ♡';
  renderWeek();
}
function renderWeek() {
  const today = vnDate();
  const monday = new Date(weekKey() + 'T12:00:00Z');
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

function weekKey() {
  const date = new Date(vnDate() + 'T12:00:00Z');
  date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
  return date.toISOString().slice(0, 10);
}
s.rewardWeeks = Array.isArray(s.rewardWeeks)
  ? [...new Set(s.rewardWeeks.filter(day => typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day)))]
  : [];

function showItems(editable, opener) {
  const cards = items.map((item, index) => {
    const owned = s.rewards.includes(item);
    const equipped = s.equipped === item;
    const art = `<img src="assets/props/${item}.png" alt=""><span>${names[index]}</span>`;
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

popupBody.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  const item = button.dataset.equip;
  if (item && s.rewards.includes(item)) {
    s.equipped = item;
    save();
    updateEquipped();
    showItems(true);
    popupBody.querySelector(`[data-equip="${item}"]`).focus();
    say('Món này đáng yêu quá! ♡');
    void animate([['outfit.change', {outfitEl: $('equipped')}]]);
  } else if (button.hasAttribute('data-remove') && s.equipped) {
    const previous = s.equipped;
    s.equipped = null;
    save();
    updateEquipped();
    showItems(true);
    popupBody.querySelector(`[data-equip="${previous}"]`).focus();
  }
});

for (const [id, name] of signs) $('zodiac').add(new Option(name, id));
$('zodiac').value = s.sign;
$('zodiac').addEventListener('change', event => {
  actionId++;
  motion.clear();
  s.sign = event.target.value;
  save();
  render();
  say('Mình sẽ đồng hành với bạn!');
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
  select.dispatchEvent(new Event('change'));
  react();
});
petControl.onclick=event=>{
  if(!suppressTap||event.detail===0)react();
  suppressTap=false;
};
$('care').addEventListener('click', () => {
  const today = vnDate();
  if (s.days.includes(today)) return;

  const fromLevel = level();
  const week = weekKey();
  s.days.push(today);
  const toLevel = level();
  const sunday = new Date(today + 'T12:00:00Z').getUTCDay() === 0;
  let reward;
  if (sunday && !s.rewardWeeks.includes(week)) {
    const available = items.filter(item => !s.rewards.includes(item));
    if (available.length) {
      reward = available[Math.floor(Math.random() * available.length)];
      s.rewards.push(reward);
      s.rewardWeeks.push(week);
    }
  }
  save();
  render();
  say('Mình nhận được năng lượng rồi! Cảm ơn bạn ♡');

  const effects = [['care.confirm', {level: fromLevel}]];
  if (toLevel > fromLevel) effects.push(['character.evolve', {fromLevel, toLevel, level: fromLevel}]);
  if (reward) effects.push(['reward.chest.open']);
  void animate(effects);

  if (reward) {
    const label = names[items.indexOf(reward)];
    showPopup('Quà cuối tuần!', `<img class="mindi-reward-art rc1-reward" src="assets/props/${reward}.png" alt=""><p>Nhận được <strong>${label}</strong></p><button class="mindi-btn primary" data-equip="${reward}">Trang bị ngay</button>`, {reward: true, opener: $('care')});
  } else {
    const copy = new Date(today + 'T12:00:00Z').getUTCDay() === 6
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
render();
setInterval(render, 30000);

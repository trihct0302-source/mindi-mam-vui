const { chromium, webkit } = require(process.env.MINDI_PLAYWRIGHT || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const output = process.env.MINDI_TEST_OUTPUT || path.join(__dirname, 'evidence');
const base = process.env.MINDI_TEST_URL || 'http://127.0.0.1:18769/';
const key = 'mindi-mamvui-v1';
const signs = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];
const sizes = [[1440,900],[1024,768],[320,568],[360,640],[390,844],[430,932],[844,390]];

function history(length) {
  return Array.from({length}, (_, i) => new Date(Date.UTC(2026,10,21-i)).toISOString().slice(0,10));
}
async function pageFor(browser, width, height, data, iso = '2026-11-22T03:00:00Z', reduced = 'reduce') {
  const mobile = width < 1000;
  const context = await browser.newContext({viewport:{width,height}, hasTouch:mobile,isMobile:mobile,reducedMotion:reduced});
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  await page.clock.setFixedTime(new Date(iso));
  await page.addInitScript(({ key, data }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(data));
    window.motionEvents = [];
    document.addEventListener('mindi:motion', e => window.motionEvents.push([e.detail.name,e.detail.motion]));
  }, {key,data});
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400 && !r.url().endsWith('/favicon.ico')) errors.push(r.url()); });
  await page.goto(base);
  await page.locator('#character').evaluate(image => image.decode());
  return {page,context,errors,mobile};
}
const readState = page => page.evaluate(key => JSON.parse(localStorage.getItem(key)), key);
const dialogTitle = page => page.locator('#popup-title').textContent();
const motionComplete = (page, name) => page.waitForFunction(name => window.motionEvents.some(e => e[0]==='complete'&&e[1]===name),name);

async function responsive(browser, engine, width, height) {
  const {page,context,errors,mobile} = await pageFor(browser,width,height,{sign:'aquarius',days:history(2),rewards:[],rewardWeeks:[]});
  try {
    const action = selector => mobile ? page.locator(selector).tap() : page.locator(selector).click();
    const layout = () => page.evaluate(() => {
      const box = id => document.querySelector(id).getBoundingClientRect();
      const [top,bubble,pet,bottom] = ['#top','#bubble','#petControl','#bottom'].map(box);
      return {width:innerWidth,doc:document.documentElement.scrollWidth,clean:top.bottom<=bubble.top&&bubble.bottom<=pet.top&&pet.bottom<=bottom.top};
    });
    assert.deepEqual(await layout(),{width,doc:width,clean:true});
    assert.equal(await page.locator('#week li').count(),7);
    await action('#care');
    await page.locator('dialog[open]').waitFor();
    assert.equal(await dialogTitle(page),'Quà cuối tuần!');
    assert(await page.locator('#care').isDisabled());
    assert.equal(await page.locator('#week [aria-current] .day-marker').textContent(),'✓');
    if (width===390) await page.screenshot({path:path.join(output,engine+'-390-reward.png')});
    await motionComplete(page,'reward.chest.open');
    await action('[data-equip]');
    await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).equipped,key);
    const equipped = (await readState(page)).equipped;
    assert(equipped);
    assert.equal(await page.locator(`[data-equip="${equipped}"]`).getAttribute('aria-pressed'),'true');
    await action('.close');
    await page.reload();
    assert(await page.locator('#care').isDisabled());
    assert.equal((await readState(page)).days.length,3);
    assert.equal((await readState(page)).rewards.length,1);
    assert.equal((await readState(page)).equipped,equipped);
    assert.equal(await page.locator('#equipped').getAttribute('hidden'),null);
    if ([390,1440,320].includes(width)) await page.screenshot({path:path.join(output,`${engine}-${width}-game.png`),fullPage:true});
    await action('#wardrobe');
    const dialogBounds = await page.locator('dialog').evaluate(d=>({width:d.clientWidth,scrollWidth:d.scrollWidth,visible:d.getBoundingClientRect().bottom <= innerHeight+1}));
    assert.equal(dialogBounds.width,dialogBounds.scrollWidth);
    assert(dialogBounds.visible,JSON.stringify(dialogBounds));
    assert.equal(await page.locator('.mindi-slot:disabled').count(),15);
    await action('[data-remove]');
    await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).equipped===null,key);
    await action('.close');
    await action('#collection');
    assert.equal(await page.locator('.mindi-slot').count(),16);
    assert.equal(await page.locator('.mindi-slot.locked').count(),15);
    await action('.close');
    await action('#info');
    assert.match(await page.locator('#modalBody').textContent(),/3 ngày/);
    if (!mobile) {
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('dialog').evaluate(d => d.open),false);
      await page.waitForFunction(()=>document.activeElement.id==='info');
    }
    assert.deepEqual(errors,[]);
    return {width,height,status:'PASS'};
  } finally { await context.close(); }
}

async function evolution(browser, count, to) {
  const {page,context,errors} = await pageFor(browser,390,844,{sign:'aquarius',days:history(count),rewards:['flower'],equipped:'flower',rewardWeeks:[]}, undefined, 'no-preference');
  try {
    await page.locator('#care').tap();
    await motionComplete(page,'character.evolve');
    await motionComplete(page,'reward.chest.open');
    await page.locator('.close').tap();
    assert.match(await page.locator('#character').getAttribute('src'),new RegExp(`idle/aquarius_lv${to}\\.gif$`));
    await page.reload();
    for (const sign of signs) {
      await page.locator('#zodiac').selectOption(sign);
      await page.waitForFunction(({key,sign})=>JSON.parse(localStorage.getItem(key)).sign===sign,{key,sign});
      await page.locator('#character').evaluate(image=>image.decode());
      assert.match(await page.locator('#character').getAttribute('src'),new RegExp(`idle/${sign}_lv${to}\\.gif$`));
      assert.equal((await readState(page)).equipped,'flower');
    }
    assert.equal((await readState(page)).days.length,count+1);
    assert.deepEqual(errors,[]);
    return {threshold:count+1,level:to,signs:signs.length,status:'PASS'};
  } finally { await context.close(); }
}

async function weekend(browser) {
  const {page,context} = await pageFor(browser,390,844,{sign:'aries',days:[],rewards:[],rewardWeeks:[]},'2026-11-21T03:00:00Z');
  try {
    await page.locator('#care').tap();
    await page.locator('dialog[open]').waitFor();
    assert.equal((await readState(page)).rewards.length,0);
    await page.locator('.close').tap();
    await page.clock.setFixedTime(new Date('2026-11-21T17:00:00Z'));
    await page.reload();
    assert(await page.locator('#care').isEnabled());
    await page.locator('#care').tap();
    await page.locator('dialog[open]').waitFor();
    assert.equal((await readState(page)).rewards.length,1);
    assert.equal((await readState(page)).days.length,2);
    return {boundary:'00:00 Vietnam',status:'PASS'};
  } finally { await context.close(); }
}
async function simultaneousCare(browser) {
  const {page,context} = await pageFor(browser,390,844,{sign:'aquarius',days:[],rewards:[],rewardWeeks:[]});
  try {
    const second = await context.newPage();
    await second.clock.setFixedTime(new Date('2026-11-22T03:00:00Z'));
    await second.goto(base);
    await Promise.all([page,second].map(tab=>tab.locator('#care').evaluate(button=>button.click())));
    await Promise.all([page,second].map(tab=>tab.waitForFunction(()=>document.querySelector('#care').disabled)));
    const saved = await readState(page);
    assert.equal(saved.days.length,1);
    assert.equal(saved.rewards.length,1);
    assert.equal(saved.rewardWeeks.length,1);
    const popups = await Promise.all([page,second].map(tab=>tab.locator('dialog').evaluate(dialog=>dialog.open)));
    assert.equal(popups.filter(Boolean).length,1);
    return {status:'PASS',webLocks:await page.evaluate(()=>Boolean(navigator.locks))};
  } finally { await context.close(); }
}

async function checkGallery(browser, engine) {
  const {page,context} = await pageFor(browser,390,844,{sign:'aquarius',days:[],rewards:[],rewardWeeks:[]});
  try {
    assert.match(await page.locator('#character').getAttribute('src'),/aquarius_lv1\.png$/);
    await page.locator('#petControl').tap();
    await motionComplete(page,'character.tap');
    assert.match(await page.locator('#character').getAttribute('src'),/aquarius_lv1\.png$/);
    await page.goto(new URL('staging/gallery.html',base).href);
    const items = await page.locator('#accessory option').evaluateAll(options=>options.map(o=>o.value).filter(Boolean));
    assert.equal(items.length,16);
    let placements = 0;
    for (const state of ['portrait','idle','sleepy','tap','energy','cheer']) {
      await page.locator('#motion').selectOption(state);
      for (const item of items) {
        await page.locator('#accessory').selectOption(item);
        const positions = await page.locator('#forms .accessory').evaluateAll(images=>images.map(image=>[
          '--accessory-x','--accessory-y','--accessory-size'
        ].map(property=>parseFloat(image.style.getPropertyValue(property)))));
        assert.equal(positions.length,48);
        for (const [x,y,size] of positions) assert([x,y].every(value=>value>=size/2 && value<=100-size/2));
        placements += positions.length;
      }
    }
    await page.locator('#motion').selectOption('idle');
    await page.locator('#accessory').selectOption('bow');
    const sprites = page.locator('#forms .sprite img:not(.accessory)');
    assert(await sprites.evaluateAll(images=>images.some(image=>image.style.clipPath.startsWith('inset('))));
    assert(await sprites.evaluateAll(images=>images.some(image=>image.src.includes('qa-v151/animations/idle/leo_lv3.gif'))));
    await page.locator('#forms figure').nth(40).scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(output,engine+'-gallery.png')});
    return {status:'PASS',placements,reducedMotion:'portrait'};
  } finally { await context.close(); }
}

(async () => {
  fs.mkdirSync(output,{recursive:true});
  const engine = process.argv[2] ?? 'chrome';
  const browser = engine==='webkit' ? await webkit.launch() : await chromium.launch({channel:'chrome'});
  const result={engine,version:browser.version(),responsive:[],evolution:[]};
  try {
    for (const [width,height] of sizes) result.responsive.push(await responsive(browser,engine,width,height));
    for (const [count,level] of [[6,2],[20,3],[44,4]]) result.evolution.push(await evolution(browser,count,level));
    result.weekend = await weekend(browser);
    result.concurrent = await simultaneousCare(browser);
    result.gallery = await checkGallery(browser,engine);
  } finally {
    fs.writeFileSync(path.join(output,engine+'.json'),JSON.stringify(result,null,2));
    await browser.close();
  }
})().catch(e=>{console.error(e);process.exitCode=1});

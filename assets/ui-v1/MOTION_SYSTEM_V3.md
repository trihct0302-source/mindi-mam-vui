# Motion System V3

## Purpose
Reusable event-driven animation controller for MINDI Mầm Vui. It maps gameplay/UI events to animation choreography and accepts character/item state as data. It does not own progression, inventory, authentication, or persistence.

## Existing source assets verified in repository
- 12 zodiac characters × 4 levels = 48 evolution-stage variants.
- 5 animation states for every character and level: idle, sleepy, tap, cheer, energy.
- 16 item PNGs under `assets/props/`.
- 4 time-of-day backgrounds.

## Files
- `motion-system-v3.js`: event-driven controller, gesture handlers, animation asset resolver, reduced-motion handling, custom event dispatch.
- `motion-system-v3.css`: reusable animation classes and CSS effects.
- `motion-v3-demo.html`: standalone test harness covering all eight requested areas.
- `MOTION_SYSTEM_V3.md`: event contract, integration contract and QA matrix.

## API
```js
import { MindiMotion } from './motion-system-v3.js';
const motion = new MindiMotion({root: document, characterEl: document.querySelector('#pet')});
motion.play('reward.chest.open', {characterId:'aries', level:1, itemEmoji:'🌼'});
motion.play('character.evolve', {characterId:'aries', fromLevel:1, toLevel:2});
motion.play('outfit.change', {outfitEl: document.querySelector('#equipped')});
// subscribe: document.addEventListener('mindi:motion', e => console.log(e.detail));
// cleanup: motion.destroy();
```

## Supported events
- `character.idle`, `character.sleep`, `character.tap`, `care.confirm`
- `reward.chest.open`, `reward.item.reveal`
- `character.evolve` (only higher target stage; levels clamp 1–4)
- `gesture.swipe`, `gesture.drag-drop` (drop event emitted with itemId/target)
- `outfit.change`
- `screen.transition`
- `loading.show`, `loading.hide`

## Architecture rules
1. Gameplay code emits an event only after validating the action; the controller never awards items, advances a level, or persists state.
2. Character id, level, item id, outfit and target screen are passed in context. Do not create per-zodiac animation implementations.
3. Use the controller's event callbacks to update game state or analytics outside the animation module.
4. Call `destroy()` when the game screen is unmounted to remove listeners and timers.
5. The controller respects `prefers-reduced-motion`; test with it enabled.

## Chest / item art
The repository does not currently contain a dedicated chest sprite. The chest is a procedural CSS pixel-style illustration in V3, not an invented missing image asset. Replace it later with approved transparent sprite art without changing the API.

## Scope
This is an isolated V3 animation library and test harness. Production `index.html`, Supabase, user data, inventory, leaderboard, and GitHub Pages deployment are not modified. No merge performed.

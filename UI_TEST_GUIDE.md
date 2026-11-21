# Mầm Vui – UI V1 Game Test

This is an isolated test build based on the current `main/index.html` gameplay logic.

## Run locally
1. Download the repository branch `feature/mam-vui-cosy-ui-v1` as ZIP, or clone it.
2. Keep the root `ui-test.html` beside the existing `assets/` directory.
3. Open `ui-test.html` in a modern browser. For best results, serve the repository root with a local static server (for example VS Code Live Server) so SVG sprite and asset paths resolve consistently.
4. Test on a 390px-wide mobile viewport and a desktop viewport.

## Test scenarios
- First visit: inspect main screen hierarchy, button contrast, speech bubble and character layering.
- Tap character: tap animation and dialogue remain visible.
- Care once: button transitions to disabled state; progress and level text remain legible.
- Repeat care: confirm no duplicate care is recorded for the same Vietnam calendar day.
- Wardrobe and collection: inspect modal/panel bounds, item grid and selected state.
- Progress modal: verify content does not overflow on a short mobile viewport.
- Change zodiac: confirm the selected character and animations still load.
- Switch device viewport: check bottom navigation and care CTA remain reachable.

## Important
- `ui-test.html` is an isolated skin test. The production `index.html` is not modified.
- The game currently stores progress in localStorage in this browser; this test does not validate Supabase or cross-user isolation.
- SVG assets are transparent by construction. Verify on both light and dark backgrounds; do not convert to JPEG.
- Do not merge the UI skin into production until visual and interaction QA is approved.


## Panel & Popup V2

Open `assets/ui-v1/popup-v2-demo.html` while serving the repository root. This is an interactive component gallery with five templates: reward, care confirmation, wardrobe, collection, and character notice. Change the character selector to inspect the shared layout with all 12 character portraits.

The demo is sample-only. Buttons and filters demonstrate visual states and do not write game progress, inventory, or Supabase records.


## Motion V2 test

The popup demo includes a shared motion layer:
- Modal enter / close transition
- Reward item reveal
- Character idle bob and care-confirm celebration
- Sparkle accent on reward/equip/care confirmation
- Item selected micro-interaction
- Progress fill and toast entrance
- `prefers-reduced-motion` fallback disables non-essential animation

Test on a 390px mobile viewport and desktop. Switch all 12 character options and open each of the five popup templates. Confirm that repeated care confirmation is disabled in the demo after the first confirmation (demo-only state; refresh resets it).

## Motion System V3 test

Open `assets/ui-v1/motion-v3-demo.html` while serving the repository root. It exercises the reusable event-driven controller without writing game state.

### Scenarios
- Chest open and item reveal.
- Care confirmation reaction.
- Character tap and idle state.
- Evolution from selected level to the next available level (1→2→3→4) using the existing per-sign GIF assets.
- Outfit change and item drag/drop.
- Swipe gesture feedback.
- Screen transition and loading show/hide.
- Switch all 12 signs and all 4 levels.
- Enable OS reduced-motion preference and confirm effects are suppressed.

### Integration contract
Gameplay must validate an action first, then call the motion API. The motion module only presents animation and emits `mindi:motion` events; it must never award inventory, advance evolution, persist progress, or write Supabase. Production integration remains a separate approved step.


V3 also includes `assets/ui-v1/motion-gameplay-adapter-v3.js`, a small adapter for calling motion only after accepted gameplay outcomes (care, reward grant, evolution, equip). It is an integration contract, not connected to production game state yet.

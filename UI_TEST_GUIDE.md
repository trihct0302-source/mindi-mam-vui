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

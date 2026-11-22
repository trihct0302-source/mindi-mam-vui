#!/usr/bin/env python3
"""Static visual-asset and clipping guardrails for MINDI V1.4."""
from pathlib import Path
import re
import sys
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
errors, warnings = [], []

signs = ["aries", "taurus", "gemini", "cancer", "leo", "virgo",
         "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"]
levels = range(1, 5)
states = ["idle", "sleepy", "tap", "cheer", "energy"]

pngs = list((ASSETS / "characters").glob("*.png"))
expected_pngs = {f"{s}_lv{n}.png" for s in signs for n in levels}
missing_pngs = sorted(expected_pngs - {p.name for p in pngs})
if missing_pngs:
    errors.append(f"Missing character PNGs: {missing_pngs}")

edge_hits = []
for path in pngs:
    try:
        im = Image.open(path).convert("RGBA")
        if im.size != (384, 384):
            warnings.append(f"{path.name}: unexpected dimensions {im.size}")
        alpha = im.getchannel("A")
        a = alpha.load()
        w, h = im.size
        # Check visible alpha at the outermost pixel row/column.
        hits = sum(a[x, 0] > 0 or a[x, h-1] > 0 for x in range(w))
        hits += sum(a[0, y] > 0 or a[w-1, y] > 0 for y in range(h))
        if hits:
            edge_hits.append((path.name, hits))
    except Exception as exc:
        errors.append(f"Cannot read {path.name}: {exc}")
if edge_hits:
    errors.append(f"Non-transparent character canvas edges: {edge_hits[:12]}")

gif_missing = []
gif_count = 0
for state in states:
    folder = ASSETS / "animations" / state
    for sign in signs:
        for level in levels:
            path = folder / f"{sign}_lv{level}.gif"
            if not path.exists():
                gif_missing.append(str(path.relative_to(ROOT)))
            else:
                gif_count += 1
                try:
                    with Image.open(path) as im:
                        if getattr(im, "n_frames", 1) < 2:
                            warnings.append(f"{path.name}: GIF has fewer than 2 frames")
                except Exception as exc:
                    errors.append(f"Cannot read GIF {path}: {exc}")
if gif_missing:
    errors.append(f"Missing animation GIFs ({len(gif_missing)}): {gif_missing[:12]}")

popup_css = (ASSETS / "ui-v1" / "popup-v2.css").read_text(encoding="utf-8")
if not re.search(r"\.mindi-modal\s*\{[^}]*overflow\s*:\s*visible", popup_css, re.S):
    errors.append("Popup clipping guard missing: .mindi-modal overflow:visible")
if not re.search(r"\.mindi-character\s+\.mindi-equipped-preview\s*\{[^}]*width\s*:\s*48px", popup_css, re.S):
    errors.append("Equipped preview sizing override missing")

# Check direct local references in the three demo HTML files and CSS url() references.
html_files = [ROOT / "ui-test.html", ASSETS / "ui-v1" / "popup-v2-demo.html",
              ASSETS / "ui-v1" / "motion-v3-demo.html"]
for html in html_files:
    text = html.read_text(encoding="utf-8")
    for ref in re.findall(r'''(?:src|href)=["']([^"'#]+)["']''', text):
        if "${" in ref or ref.startswith(("http://", "https://", "data:", "mailto:", "javascript:")):
            continue
        target = (html.parent / ref.split("?")[0]).resolve()
        if not target.exists():
            errors.append(f"Missing HTML asset: {html.relative_to(ROOT)} -> {ref}")
for css in (ASSETS / "ui-v1").glob("*.css"):
    text = css.read_text(encoding="utf-8")
    for ref in re.findall(r"url\((?!['\"]?data:)(?:['\"]?)([^)'\"]+)", text):
        if ref.startswith(("http://", "https://")):
            continue
        target = (css.parent / ref.split("?")[0]).resolve()
        if not target.exists():
            errors.append(f"Missing CSS asset: {css.relative_to(ROOT)} -> {ref}")

print(f"Character PNGs: {len(pngs)} (expected 48)")
print(f"Animation GIFs: {gif_count} (expected 240)")
print(f"Transparent-edge violations: {len(edge_hits)}")
print(f"Warnings: {len(warnings)}")
for item in warnings:
    print("WARN:", item)
for item in errors:
    print("FAIL:", item)
if errors:
    sys.exit(1)
print("PASS: V1.4 static visual asset checks")

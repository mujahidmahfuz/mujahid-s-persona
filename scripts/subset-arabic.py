#!/usr/bin/env python3
"""Subset the Amiri Arabic font to exactly the characters used by the Quranic epigraphs
(src/data/cache/quran.json) plus the verse-number ornaments. Output: src/assets/fonts/amiri-epigraphs.woff2.
Run after `npm run epigraphs` (scripts/epigraphs.ts calls this automatically when python3 is available)."""
import json, pathlib, sys
from fontTools import subset

root = pathlib.Path(__file__).resolve().parent.parent
quran = json.loads((root / 'src/data/cache/quran.json').read_text(encoding='utf-8'))
chars = set('﴿﴾٠١٢٣٤٥٦٧٨٩ ')
for entry in quran.values():
    for v in entry['verses']:
        chars.update(v['arabic'])
src = root / 'node_modules/@fontsource/amiri/files/amiri-arabic-400-normal.woff2'
out = root / 'src/assets/fonts/amiri-epigraphs.woff2'
opts = subset.Options()
opts.flavor = 'woff2'
opts.layout_features = ['*']  # keep Arabic shaping (init/medi/fina, ligatures, marks)
opts.name_IDs = ['*']
font = subset.load_font(str(src), opts)
s = subset.Subsetter(opts)
s.populate(unicodes=[ord(c) for c in chars])
s.subset(font)
subset.save_font(font, str(out), opts)
print(f'subset-arabic: {len(chars)} characters -> {out.relative_to(root)} ({out.stat().st_size // 1024} KB)')

"""Builds the Adipoli Affairs printed menu book (A4 PDF) from the live menu.

Look: frosted glass panels over a deep near-black background lit by soft,
out-of-focus orange / amber / saffron glows and a heavily blurred food photo.
Dish names, prices and descriptions are the focus; photos are small rounded
squares in glass frames.

How it stays print safe:
  1. Layout pass. A page with a small script is opened in headless Chrome. The
     script moves the dishes, unit by unit, into fixed 210x297mm page boxes
     (a unit is a heading plus its first dishes, or one dish, so nothing ever
     splits), picks the spacing per menu section so pages are evenly filled and
     the book lands on 16 pages, then measures every glass panel.
  2. Python pre-renders one background image per page (glows, blurred photo,
     the soft panel shadows, the frosted blur and inner glow under each panel,
     and fine grain so large areas don't band in print). No CSS backdrop-filter.
  3. The laid-out pages are written as static HTML on top of those images and
     printed to PDF. Text stays real vector text.

Photo for each dish: the new menu photo in design/menu-photos if one exists,
otherwise the dish's current website photo. Re-run whenever new photos arrive.

Usage (from the project root):
  python design/menu-book/build_menu_book_glass.py        -> Adipoli-Menu-Book.pdf (glass version, not the default)
  python design/menu-book/build_menu_book_glass.py --preview -> design/menu-book/index.html
"""
import hashlib
import html
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
MENU = HERE / 'menu-live.json'
NEW_PHOTOS = ROOT / 'design' / 'menu-photos'
IMG_OUT = HERE / 'img'
LAYOUT_OUT = HERE / 'menu-layout.html'
HTML_OUT = HERE / 'menu-book.html'
PDF_OUT = ROOT / 'Adipoli-Menu-Book.pdf'
CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
# --preview: label new ChatGPT photos and skip the PDF, for reviewing progress
PREVIEW = '--preview' in sys.argv
PREVIEW_OUT = HERE / 'index.html'
TARGET_PAGES = 16  # stapled booklet: a multiple of 4
BG_DPI = 220

GROUPS = [
    ('Lunch Menu', ['Kerala Meals', 'South Specials', 'Combo Specials', 'Biryani']),
    ('Dinner Menu', ['Breads', 'Main Course', 'Sides']),
    ('All Day Menu', ['Kids Corner', 'Desserts', 'Hot Drinks', 'Cool Drinks', 'Juice', 'Milkshake']),
]
# Categories split into Veg / Egg / Chicken ... sub-headings
SPLIT = {'Main Course'}
NOTES = {'Main Course': 'Complimentary rice not included'}
# Dishes shown on the cover, first ones found are used
COVER_DISHES = ['Chatti choru', 'Masala dosa', 'Kappa fish', 'Paal kappa beef', 'Chicken curry']

# Same rules as lib/menuData.ts inferDishTypes
OVERRIDES = {'pothichoru': ['seafood', 'egg'], 'chatti choru': ['seafood', 'chicken', 'egg']}
WORDS = [
    ('seafood', ['fish', 'prawn', 'squid', 'kalamari', 'calamari', 'meen', 'sea food', 'seafood', 'konju', 'crab']),
    ('mutton', ['mutton', 'goat', 'lamb']),
    ('beef', ['beef', 'bdf']),
    ('chicken', ['chicken', 'nugget', 'momos']),
    ('egg', ['egg', 'omlet', 'omelette']),
]
LABELS = {'veg': 'Veg', 'egg': 'Egg', 'chicken': 'Chicken', 'beef': 'Beef', 'mutton': 'Mutton', 'seafood': 'Seafood'}
ORDER = list(LABELS)


def dish_types(item):
    if item.get('diet'):
        return item['diet']
    name = item['name'].lower()
    if name in OVERRIDES:
        return OVERRIDES[name]
    for kind, words in WORDS:
        if any(w in name for w in words):
            return [kind]
    return ['veg']


def slug(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')


def base_name(name):
    """'Vizhinjam Chicken Fry (Bone-in) half' -> 'Vizhinjam Chicken Fry (Bone-in)'."""
    return re.sub(r' (half|full)$', '', name, flags=re.I)


def photo_source(item):
    """New menu photo if made, else the website photo. Returns (path, is_new)."""
    base = base_name(item['name']).lower()
    new = NEW_PHOTOS / f"adipoli-{slug(item['category'])}-{slug(base)}.png"
    if new.exists():
        return new, True
    site = ROOT / 'public' / item['image'].lstrip('/')
    return site, False


def prepared_photo(src, width):
    """Resized JPEG copy for the PDF, reused while the source is unchanged."""
    IMG_OUT.mkdir(exist_ok=True)
    out = IMG_OUT / f"{slug(str(src.relative_to(ROOT)))}-{width}.jpg"
    if not out.exists() or out.stat().st_mtime < src.stat().st_mtime:
        im = Image.open(src).convert('RGB')
        # Crop to 3:2 from the centre so every photo lines up
        w, h = im.size
        if w / h > 1.5:
            nw = int(h * 1.5)
            im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
        else:
            nh = int(w / 1.5)
            im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
        im = im.resize((width, int(width / 1.5)), Image.LANCZOS)
        im.save(out, 'JPEG', quality=82, optimize=True, progressive=True)
    return out


_KEYS = {}


def photo_key(src):
    """Same picture under two names (the website reuses some) counts as one photo."""
    if src not in _KEYS:
        _KEYS[src] = hashlib.md5(src.read_bytes()).hexdigest()[:12]
    return _KEYS[src]


def logo_files():
    """Full logo, and the logo without its small tagline for the cover (tagline set as text there)."""
    src = Image.open(ROOT / 'public' / 'Adipoli Logo V1.png').convert('RGBA')
    full, mark_only = IMG_OUT / 'logo.png', IMG_OUT / 'logo-mark.png'
    # The source is small (344px), so upscale it smoothly for print
    big = src.resize((src.width * 4, src.height * 4), Image.LANCZOS)
    big.crop(big.getbbox()).save(full)
    top = src.crop((0, 0, src.width, 111))
    top = top.resize((top.width * 4, top.height * 4), Image.LANCZOS)
    top.crop(top.getbbox()).save(mark_only)
    return full, mark_only


def mark(types):
    color = '#e53935' if any(t not in ('veg', 'egg') for t in types) else '#f2c200' if 'egg' in types else '#43a047'
    return f'<span class="mark" style="border-color:{color}"><span style="background:{color}"></span></span>'


def clock(hhmm):
    h = int(hhmm.split(':')[0])
    return f"{h % 12 or 12}{'am' if h < 12 else 'pm'}"


def price(value):
    return f'${float(value):.2f}'


def merge_sizes(items):
    """Half and full portions of one dish become a single entry with both prices."""
    out, seen = [], {}
    for item in items:
        m = re.search(r' (half|full)$', item['name'], flags=re.I)
        if not m:
            out.append({**item, 'prices': [('', item['price'])]})
            continue
        base = base_name(item['name'])
        if base not in seen:
            seen[base] = {**item, 'name': base, 'prices': []}
            out.append(seen[base])
        seen[base]['prices'].append((m.group(1).capitalize(), item['price']))
    for item in out:
        item['prices'].sort(key=lambda p: {'Half': 0, 'Full': 1}.get(p[0], 0))
    return out


def dish_html(item, cat):
    types = sorted(dish_types(item), key=ORDER.index)
    src, is_new = photo_source(item)
    photo = ''
    if src.exists():
        img = prepared_photo(src, 600)
        photo = (f' data-photo="img/{img.name}" data-src="{html.escape(str(src.relative_to(ROOT)))}"'
                 f' data-key="{photo_key(src)}" data-new="{int(is_new)}" data-pname="{html.escape(item["name"])}"')
    prices = ''.join(
        f'<span class="p">{f"<em>{label}</em>" if label else ""}{price(value)}</span>' for label, value in item['prices'])
    desc = (item.get('desc') or '').strip()
    if cat in NOTES:
        desc = desc.replace(NOTES[cat] + '.', '').strip()
    desc = html.escape(desc)
    return (f'<div class="dish"{photo}>'
            f'<div class="line">{mark(types)}<h4>{html.escape(item["name"])}</h4>'
            f'<span class="price">{prices}</span></div>'
            f'{f"<p>{desc}</p>" if desc else ""}</div>')


# ---------------------------------------------------------------- backgrounds

PALETTE = [(232, 115, 26), (246, 160, 25), (255, 140, 40), (196, 70, 18), (246, 184, 28), (214, 92, 22)]


def _blur(arr, radius):
    """Gaussian blur of a float HxW or HxWx3 array (float precision kept, so no banding)."""
    from scipy.ndimage import gaussian_filter
    sigma = (radius, radius) if arr.ndim == 2 else (radius, radius, 0)
    return gaussian_filter(np.asarray(arr, np.float32), sigma=sigma, mode='nearest')


def render_background(out, seed, rects, photo=None, kind='list'):
    """One page background: dark base, blurred colour glows, a blurred food photo,
    soft panel shadows, and the frosted (blurred, smoked, edge-lit) area under each panel."""
    W, H = round(210 / 25.4 * BG_DPI), round(297 / 25.4 * BG_DPI)
    w, h = W // 2, H // 2           # everything soft is drawn at half size
    mm = w / 210
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)

    top, bottom = np.array([16, 12, 10], np.float32), np.array([9, 7, 6], np.float32)
    t = (yy / h)[..., None]
    img = top * (1 - t) + bottom * t

    # Large out-of-focus glows, mostly towards the page edges so text panels stay dark enough
    n = 5 if kind == 'cover' else 4
    for k in range(n):
        side = k % 4
        cx = [rng.uniform(-30, 40), rng.uniform(170, 240), rng.uniform(-20, 230), rng.uniform(-20, 230)][side]
        cy = [rng.uniform(-20, 320), rng.uniform(-20, 320), rng.uniform(-40, 30), rng.uniform(260, 330)][side]
        r = rng.uniform(55, 105) * (1.25 if kind == 'cover' else 1)
        col = np.array(PALETTE[rng.integers(len(PALETTE))], np.float32)
        a = rng.uniform(.42, .72) * (1.15 if kind == 'cover' else 1)
        g = np.exp(-(((xx - cx * mm) ** 2 + (yy - cy * mm) ** 2) / (2 * (r * mm / 1.6) ** 2)))
        img = 255 - (255 - img) * (1 - np.clip(a * g, 0, 1)[..., None] * col / 255)

    # A heavily blurred food photo glowing through one side
    if photo is not None and Path(photo).exists():
        ph = Image.open(photo).convert('RGB')
        size = int((150 if kind != 'cover' else 210) * mm)
        ph = ph.resize((size, int(size * ph.height / ph.width)), Image.BILINEAR)
        ph = np.asarray(ph.filter(ImageFilter.GaussianBlur(14 * mm)), np.float32)
        ph_h, ph_w = ph.shape[:2]
        if kind == 'cover':
            ox, oy = (w - ph_w) // 2, int(150 * mm)
        else:
            ox = int(rng.choice([-50, 110]) * mm)
            oy = int(rng.uniform(40, 200) * mm)
        py, px = np.mgrid[0:ph_h, 0:ph_w].astype(np.float32)
        d = np.sqrt(((px - ph_w / 2) / (ph_w / 2)) ** 2 + ((py - ph_h / 2) / (ph_h / 2)) ** 2)
        m = np.clip(1.15 - d, 0, 1) ** 1.6 * (.62 if kind == 'cover' else .5)
        x0, y0, x1, y1 = max(ox, 0), max(oy, 0), min(ox + ph_w, w), min(oy + ph_h, h)
        if x1 > x0 and y1 > y0:
            sub = ph[y0 - oy:y1 - oy, x0 - ox:x1 - ox] * .9
            mm_ = m[y0 - oy:y1 - oy, x0 - ox:x1 - ox][..., None]
            img[y0:y1, x0:x1] = img[y0:y1, x0:x1] * (1 - mm_) + np.maximum(sub, img[y0:y1, x0:x1]) * mm_

    if rects:
        sharp = Image.new('F', (w, h), 0)
        drop = Image.new('F', (w, h), 0)
        ds, dd = ImageDraw.Draw(sharp), ImageDraw.Draw(drop)
        for x, y, rw, rh, rr in rects:
            box = [x * mm, y * mm, (x + rw) * mm, (y + rh) * mm]
            ds.rounded_rectangle(box, radius=rr * mm, fill=1)
            dd.rounded_rectangle([box[0] + .6 * mm, box[1] + 2.2 * mm, box[2] + .6 * mm, box[3] + 2.6 * mm], radius=rr * mm, fill=1)
        sharp = _blur(np.asarray(sharp), .6)
        shadow = _blur(np.asarray(drop), 3.2 * mm)
        img = img * (1 - .62 * shadow * (1 - sharp))[..., None]
        # Frost: what is behind the panel, blurred again, smoked darker, slightly milky
        frosted = _blur(img, 4 * mm) * .66 + np.array([30, 24, 20], np.float32) * .34 + 7
        # Inner glow just inside the panel edge
        rim = np.clip(sharp - _blur(sharp, 2.2 * mm), 0, 1) * 2
        frosted = frosted + rim[..., None] * np.array([70, 58, 46], np.float32)
        img = img * (1 - sharp[..., None]) + frosted * sharp[..., None]

    big = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)
    arr = np.asarray(big, np.float32) + rng.normal(0, 2.0, (H, W, 1)).astype(np.float32)
    Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).save(out, 'JPEG', quality=84, optimize=True)


# ---------------------------------------------------------------- page pieces

CSS = r'''
@page { size: 210mm 297mm; margin: 0; }
:root { --orange:#ee7a1f; --amber:#ffb627; --gold:#ffcf5a; --ink:#ffffff; --soft:#e6ddd3; --muted:#bfb3a7; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin:0; font-family: Barlow, Arial, sans-serif; color: var(--ink); background:#3a3633; }
h2, h3, h4, h5 { margin:0; font-weight: normal; }
.page { width:210mm; height:297mm; position:relative; overflow:hidden; break-after: page; page-break-after: always;
  background-color:#0c0908; background-size: 210mm 297mm; background-repeat:no-repeat; }
.page:last-child { break-after: auto; page-break-after: auto; }
@media screen { .page { margin: 0 auto 8mm; box-shadow: 0 2mm 8mm rgba(0,0,0,.5); } body { padding: 8mm 0; } }
@media print { body { background: none; } }
#source { display:none; }

/* glass */
.glass { position:relative; border-radius: 5mm; border: .35mm solid rgba(255,255,255,.30); border-top-color: rgba(255,255,255,.55); border-left-color: rgba(255,255,255,.42);
  background: linear-gradient(155deg, rgba(255,255,255,.15) 0%, rgba(255,255,255,.06) 38%, rgba(255,255,255,.03) 70%, rgba(255,255,255,.07) 100%); }
.glass::before { content:""; position:absolute; inset:0; border-radius: inherit; pointer-events:none;
  background: radial-gradient(120mm 46mm at 0% 0%, rgba(255,255,255,.16), rgba(255,255,255,0) 70%); }
.glass > * { position:relative; }
.chip { display:inline-block; border-radius: 10mm; border: .3mm solid rgba(255,255,255,.4); background: linear-gradient(160deg, rgba(255,255,255,.2), rgba(255,255,255,.07)); }

/* list pages */
.top { position:absolute; top: 9mm; left: 16mm; right: 16mm; height: 8mm; padding: 0 5mm; border-radius: 10mm; display:flex; justify-content:space-between; align-items:center;
  font: 600 7.5pt Barlow, sans-serif; letter-spacing: .28em; text-transform: uppercase; color: var(--soft); }
.top b { color: var(--amber); font-weight: 700; }
.top .dot { display:inline-block; width:1.6mm; height:1.6mm; border-radius:50%; background: var(--orange); margin-right: 2mm; vertical-align: .2mm; }
.col { position:absolute; top: 22mm; bottom: 22.5mm; left: 16mm; right: 16mm; display:flex; flex-direction:column; gap: 5mm; }
.foot { position:absolute; left: 16mm; right: 16mm; bottom: 8.5mm; height: 9mm; padding: 0 5mm; border-radius: 10mm; display:flex; justify-content: space-between; align-items:center; font-size: 7.5pt; color: var(--muted); }
.foot .legend { display:flex; gap: 4mm; }
.foot { color: var(--soft); }
.legend span { display:inline-flex; align-items:center; gap: 1.5mm; }
.foot .num { font: 700 11pt 'Barlow Condensed', sans-serif; color: var(--gold); letter-spacing:.12em; }

.opener { padding: 2mm 1mm 0; }
.opener .kick { font: 700 8pt Barlow, sans-serif; letter-spacing: .34em; text-transform: uppercase; color: var(--orange); }
.opener h2 { font: 700 56pt/.92 'Barlow Condensed', sans-serif; text-transform: uppercase; letter-spacing: .01em; margin-top: 2mm; }
.opener .cats { margin-top: 3mm; font-size: 9pt; color: var(--soft); letter-spacing: .04em; }
.opener .cats i { font-style: normal; color: var(--orange); padding: 0 2mm; }

.panel { padding: 6mm 7.5mm 6.5mm; }
.phead { height: 21mm; display:flex; justify-content: space-between; align-items: flex-start; gap: 6mm; }
.phead h3 { font: 700 27pt/1 'Barlow Condensed', sans-serif; text-transform: uppercase; letter-spacing: .03em; }
.phead .meta { margin-top: 2.2mm; display:flex; align-items:center; gap: 3mm; flex-wrap: wrap; }
.when { font: 700 8.5pt Barlow, sans-serif; color: #1a1208; background: var(--amber); border-radius: 10mm; padding: .9mm 3.2mm; letter-spacing:.02em; }
.cont { font: 600 8.5pt Barlow, sans-serif; color: var(--muted); letter-spacing: .2em; text-transform: uppercase; }
.note { font: 600 8.5pt Barlow, sans-serif; color: var(--gold); }
.thumbs { display:flex; gap: 3mm; flex-shrink:0; }
.thumb { width: 18mm; height: 18mm; padding: .9mm; border-radius: 4.2mm; position:relative; }
.thumb img { width:100%; height:100%; object-fit:cover; border-radius: 3.2mm; display:block; }
.thumb .new { position:absolute; top: -1.5mm; left: -1.5mm; background:#fff; color:#000; font-size:6.5pt; padding:.3mm 1.4mm; border-radius:2mm; font-weight:700; }

.list { display:flex; flex-direction:column; }
.sub { display:flex; align-items:center; gap: 3mm; padding-top: calc(var(--g, 4mm) + 2mm); }
.sub h5 { font: 700 15pt/1 'Barlow Condensed', sans-serif; letter-spacing: .16em; text-transform: uppercase; color: var(--amber); }
.sub::after { content:""; flex:1; height: .35mm; background: rgba(255,182,39,.45); }
.sub.first { padding-top: 0; }
.dish { padding-top: var(--g, 4mm); }
.list > .dish:first-child { padding-top: 0; }
.dish .line { display:flex; align-items: center; gap: 2.6mm; }
.dish h4 { font: 600 12pt/1.25 Barlow, sans-serif; text-transform: uppercase; letter-spacing: .035em; color:#fff; }
.dish .price { margin-left:auto; display:flex; gap: 2mm; flex-shrink:0; }
.dish .p { font: 700 10.5pt Barlow, sans-serif; color: var(--gold); white-space: nowrap; border-radius: 10mm; padding: .5mm 2.8mm;
  border: .3mm solid rgba(255,182,39,.62); background: linear-gradient(160deg, rgba(255,182,39,.24), rgba(255,182,39,.08)); }
.dish .p em { font-style: normal; font-weight: 600; font-size: 7.5pt; color: var(--soft); text-transform: uppercase; letter-spacing: .08em; margin-right: 1.4mm; }
.dish p { margin: .9mm 0 0 6mm; max-width: 132mm; font-size: 9pt; line-height: 1.45; color: var(--soft); }
.mark { width: 3.4mm; height: 3.4mm; border: .35mm solid; border-radius: .6mm; display:inline-flex; align-items:center; justify-content:center; background:#fff; flex-shrink:0; }
.mark span { width: 1.6mm; height: 1.6mm; border-radius: 50%; }

/* cover */
.cover .kicker { position:absolute; top: 17mm; left: 0; right: 0; text-align:center; font: 700 8pt Barlow, sans-serif; letter-spacing: .4em; text-transform: uppercase; color: var(--soft); }
.cover .hero { position:absolute; top: 34mm; left: 22mm; right: 22mm; height: 118mm; text-align:center; padding-top: 22mm; border-radius: 8mm; }
.cover .hero img { width: 132mm; }
.cover .tag { margin-top: 8mm; font: 600 17pt 'Barlow Condensed', sans-serif; letter-spacing: .42em; text-transform: uppercase; color: var(--amber); }
.cover .rule { width: 34mm; height: .6mm; background: var(--orange); margin: 7mm auto 0; border-radius: 1mm; }
.cover .menu-word { margin-top: 6mm; font: 700 11pt Barlow, sans-serif; letter-spacing: .6em; text-transform: uppercase; color: #fff; padding-left: .6em; }
.cover .dishes { position:absolute; top: 166mm; left: 0; right: 0; display:flex; justify-content:center; gap: 8mm; }
.cover figure { margin:0; text-align:center; }
.cover figure .thumb { width: 44mm; height: 44mm; padding: 1.6mm; border-radius: 6mm; }
.cover figure .thumb img { border-radius: 4.6mm; }
.cover figcaption { margin-top: 3mm; font: 700 7.5pt Barlow, sans-serif; color: var(--soft); text-transform: uppercase; letter-spacing: .16em; }
.cover .gf { position:absolute; top: 232mm; left: 30mm; right: 30mm; text-align:center; padding: 4mm 8mm; border-radius: 10mm; font-size: 9.5pt; line-height: 1.5; color: #fff; }
.cover .gf b { color: var(--gold); font-weight: 700; }
.cover .info { position:absolute; left: 16mm; right: 16mm; bottom: 13mm; display:grid; grid-template-columns: repeat(4, 1fr); gap: 4mm; }
.cover .info > div { padding: 3.5mm 4mm; border-radius: 4mm; font-size: 8.5pt; line-height: 1.5; color: var(--soft); }
.cover .info b { display:block; font: 700 11pt 'Barlow Condensed', sans-serif; letter-spacing: .16em; text-transform: uppercase; color: var(--amber); margin-bottom: .6mm; }

/* back */
.back .inner { position:absolute; top: 34mm; left: 0; right: 0; text-align:center; }
.back .inner img { width: 104mm; }
.back .cater { position:absolute; left: 16mm; right: 16mm; top: 92mm; height: 74mm; padding: 13mm 16mm; text-align:center; border-radius: 7mm; }
.back .cater .chip { font: 700 8pt Barlow, sans-serif; letter-spacing: .3em; text-transform: uppercase; color: var(--gold); padding: 1.4mm 5mm; }
.back .cater h3 { margin-top: 6mm; font: 700 40pt/.95 'Barlow Condensed', sans-serif; text-transform: uppercase; letter-spacing: .02em; }
.back .cater p { margin: 5mm auto 0; max-width: 130mm; font-size: 12pt; line-height: 1.5; color: var(--soft); font-weight: 500; }
.back .contact { position:absolute; top: 178mm; left: 16mm; right: 16mm; display:grid; grid-template-columns: 1fr 1fr; gap: 5mm; }
.back .contact > div { padding: 5.5mm 7mm; border-radius: 5mm; font-size: 10.5pt; line-height: 1.55; color: #fff; }
.back .contact b { display:block; font: 700 12pt 'Barlow Condensed', sans-serif; letter-spacing: .18em; text-transform: uppercase; color: var(--amber); margin-bottom: 1mm; }
.back .small { position:absolute; left: 16mm; right: 16mm; bottom: 16mm; text-align:center; font-size: 8.5pt; color: var(--soft); line-height: 1.6; }
.back .small .legend { display:flex; justify-content:center; gap: 6mm; margin-bottom: 3mm; color: #fff; }
.overflow { outline: 3mm solid red; }
'''

# Layout script: paginates, balances spacing, picks photos, measures glass, then
# replaces the body with a JSON payload that Python reads back via --dump-dom.
JS = r'''
(async () => {
  const DATA = JSON.parse(document.getElementById('data').textContent);
  await document.fonts.ready;
  await Promise.all(["600 12pt Barlow", "400 9pt Barlow", "700 8pt Barlow", "500 9pt Barlow", "700 27pt 'Barlow Condensed'", "600 17pt 'Barlow Condensed'"]
    .map(f => document.fonts.load(f).catch(() => null)));
  const book = document.getElementById('book'), back = document.getElementById('back');
  const mm = 96 / 25.4;
  const make = s => { const t = document.createElement('template'); t.innerHTML = s.trim(); return t.content.firstElementChild; };

  function newPage(group, pages) {
    const n = 0;
    const p = make(`<section class="page list"><div class="top glass"><span><span class="dot"></span><b>Adipoli Affairs</b></span><span>${group.title}</span></div>
      <div class="col"></div><div class="foot glass"><div class="legend">${DATA.legend}</div><div>adipoliaffairs.com</div><div class="num"></div></div></section>`);
    book.insertBefore(p, back);
    pages.push(p);
    return p;
  }
  function newPanel(col, cat, cont, sub) {
    const head = DATA.heads[cat];
    const meta = cont ? '<span class="cont">continued</span>' : (head.when || '') + (head.note || '');
    const p = make(`<div class="panel glass" data-cat="${cat}"><div class="phead"><div><h3>${cat}</h3>
      <div class="meta">${meta}</div></div><div class="thumbs"></div></div><div class="list"></div></div>`);
    col.appendChild(p);
    if (cont && sub) p.querySelector('.list').appendChild(make(`<div class="sub first"><h5>${sub}</h5></div>`));
    return p;
  }
  const fits = col => col.scrollHeight <= col.clientHeight + 0.5;

  // Lays one menu group out at dish spacing g (mm). Returns its pages (in the DOM).
  function layout(group, g) {
    const pages = [];
    let page = newPage(group, pages), col = page.querySelector('.col'), panel = null;
    page.style.setProperty('--g', g + 'mm');
    col.appendChild(make(group.opener));
    for (const u of group.units) {
      const el = make(`<div class="u">${u.html}</div>`);
      const nodes = [...el.childNodes];
      const put = target => nodes.forEach(n => target.appendChild(n));
      const take = () => nodes.forEach(n => n.remove());
      if (u.newcat) {
        panel = newPanel(col, u.cat, false);
        put(panel.querySelector('.list'));
        if (!fits(col)) {
          panel.remove();
          page = newPage(group, pages); col = page.querySelector('.col'); page.style.setProperty('--g', g + 'mm');
          panel = newPanel(col, u.cat, false); put(panel.querySelector('.list'));
        }
      } else {
        put(panel.querySelector('.list'));
        if (!fits(col)) {
          take();
          page = newPage(group, pages); col = page.querySelector('.col'); page.style.setProperty('--g', g + 'mm');
          panel = newPanel(col, u.cat, true, u.startsSub ? '' : u.sub);
          put(panel.querySelector('.list'));
        }
      }
      if (!fits(col)) { page.classList.add('overflow'); console.error('OVERFLOW', u.cat); }
      // first sub heading straight under a panel heading needs no extra space
      panel.querySelectorAll('.list > .sub:first-child').forEach(s => s.classList.add('first'));
    }
    return pages;
  }
  const clear = pages => pages.forEach(p => p.remove());
  const GAPS = []; for (let g = 2.2; g <= 9.01; g += 0.2) GAPS.push(+g.toFixed(2));

  // How many pages each group needs at each spacing
  const counts = DATA.groups.map(gr => GAPS.map(g => { const ps = layout(gr, g); const n = ps.length; clear(ps); return n; }));
  const target = counts.map(c => c[0]);
  const want = DATA.target - 2;  // minus cover and back
  const per = i => DATA.groups[i].dishes / target[i];
  let total = target.reduce((a, b) => a + b, 0);
  while (total < want) {
    // give one more page to the most crowded group that can use it
    const order = target.map((_, i) => i).sort((a, b) => per(b) - per(a));
    const i = order.find(i => counts[i].includes(target[i] + 1));
    if (i === undefined) break;
    target[i]++; total++;
  }
  const chosen = counts.map((c, i) => { let best = GAPS[0]; GAPS.forEach((g, k) => { if (c[k] === target[i]) best = g; }); return best; });

  const all = [];
  DATA.groups.forEach((gr, i) => {
    const ps = layout(gr, chosen[i]);
    // even out leftover space on each page
    for (const p of ps) {
      const col = p.querySelector('.col'), n = col.querySelectorAll('.dish, .sub').length;
      const last = col.lastElementChild;
      const spare = col.getBoundingClientRect().bottom - last.getBoundingClientRect().bottom;
      if (spare > 0 && n) {
        const extra = Math.min((spare - 1) / n / mm, 5);
        p.style.setProperty('--g', (chosen[i] + extra - 0.05).toFixed(2) + 'mm');
        if (!fits(col)) p.style.setProperty('--g', chosen[i] + 'mm');
      }
    }
    all.push(...ps);
  });
  all.forEach((p, k) => p.querySelector('.num').textContent = String(k + 2).padStart(2, '0'));

  // Small photos in each panel heading, from dishes in that panel, never repeated
  const used = new Set(DATA.coverKeys);
  const bgs = [];
  for (const p of all) {
    let bg = null;
    for (const panel of p.querySelectorAll('.panel')) {
      const dishes = [...panel.querySelectorAll('.dish[data-photo]')].filter(d => !used.has(d.dataset.key));
      dishes.sort((a, b) => b.dataset.new - a.dataset.new);
      const n = panel.querySelectorAll('.dish').length;
      const want = n >= 5 ? 2 : 1;
      const picks = [];
      for (const d of dishes) { if (picks.length < want && !used.has(d.dataset.key)) { picks.push(d); used.add(d.dataset.key); } }
      const box = panel.querySelector('.thumbs');
      for (const d of picks) {
        box.appendChild(make(`<div class="thumb glass"><img src="${d.dataset.photo}" alt="">` +
          (DATA.preview && d.dataset.new === '1' ? '<span class="new">New</span>' : '') + '</div>'));
        bg = bg || d.dataset.src;
      }
    }
    bgs.push(bg);
  }
  await Promise.all([...document.images].map(i => i.complete ? null : new Promise(r => { i.onload = i.onerror = r; })));

  const out = [...book.querySelectorAll('.page')].map((p, k) => {
    const pr = p.getBoundingClientRect();
    const rects = [...p.querySelectorAll('.glass')].filter(e => !e.classList.contains('nobake')).map(e => {
      const r = e.getBoundingClientRect();
      return [(r.left - pr.left) / mm, (r.top - pr.top) / mm, r.width / mm, r.height / mm, parseFloat(getComputedStyle(e).borderTopLeftRadius) / mm];
    });
    const kind = p.classList.contains('cover') ? 'cover' : p.classList.contains('back') ? 'back' : 'list';
    return { kind, rects, photo: kind === 'list' ? bgs[k - 1] : null, html: p.outerHTML,
             overflow: !!p.querySelector('.overflow') || p.classList.contains('overflow') };
  });
  const pre = document.createElement('pre');
  pre.id = 'payload';
  pre.textContent = JSON.stringify({ pages: out, gaps: chosen, target, counts });
  document.body.innerHTML = '';
  document.body.appendChild(pre);
})();
'''


def head_html(extra_css=''):
    return f'''<!doctype html>
<html><head><meta charset="utf-8"><title>Adipoli Affairs Menu</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;500;600;700&display=block" rel="stylesheet">
<style>{CSS}{extra_css}</style></head>'''


def chrome(*args, timeout=300):
    return subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars',
                           '--run-all-compositor-stages-before-draw', *args],
                          check=True, capture_output=True, timeout=timeout)


def build():
    menu = json.loads(MENU.read_text(encoding='utf-8'))
    menu = menu if isinstance(menu, list) else menu['items']
    by_cat = {}
    for item in menu:
        if item.get('available') is False:
            continue
        by_cat.setdefault(item['category'], []).append(item)

    known = {c for _, cats in GROUPS for c in cats}
    extra = [c for c in by_cat if c not in known]
    groups = GROUPS + ([('More', extra)] if extra else [])

    data_groups, heads, total, new_count = [], {}, 0, 0
    for title, cats in groups:
        cats = [c for c in cats if by_cat.get(c)]
        units, dishes_in_group = [], 0
        for cat in cats:
            items = by_cat[cat]
            total += len(items)
            new_count += sum(photo_source(i)[1] for i in items)
            dishes = merge_sizes(items)
            dishes_in_group += len(dishes)
            times = items[0].get('timeRestriction')
            heads[cat] = {
                'when': f'<span class="when">{clock(times["start"])} to {clock(times["end"])}</span>' if times else '',
                'note': f'<span class="note">{html.escape(NOTES[cat])}</span>' if cat in NOTES else '',
            }
            if cat in SPLIT:
                parts = {}
                for d in dishes:
                    parts.setdefault(sorted(dish_types(d), key=ORDER.index)[-1], []).append(d)
                runs = [(LABELS[k], parts[k]) for k in ORDER if k in parts]
            else:
                runs = [('', dishes)]
            newcat = True
            for sub, run in runs:
                ds = [dish_html(d, cat) for d in run]
                subh = f'<div class="sub"><h5>{sub}</h5></div>' if sub else ''
                # A heading travels with its first two dishes, and the last two dishes stay together
                rest = ds[2:]
                first = ds[:2] + (rest if len(rest) < 2 else [])
                units.append({'html': subh + ''.join(first), 'cat': cat, 'sub': sub, 'newcat': newcat, 'startsSub': bool(sub)})
                if len(rest) >= 2:
                    units += [{'html': d, 'cat': cat, 'sub': sub, 'newcat': False, 'startsSub': False} for d in rest[:-2]]
                    units.append({'html': ''.join(rest[-2:]), 'cat': cat, 'sub': sub, 'newcat': False, 'startsSub': False})
                newcat = False
        opener = (f'<div class="opener"><div class="kick">Adipoli Affairs</div><h2>{html.escape(title)}</h2>'
                  f'<div class="cats">{"<i>/</i>".join(html.escape(c) for c in cats)}</div></div>')
        data_groups.append({'title': html.escape(title), 'opener': opener, 'units': units, 'dishes': dishes_in_group})

    IMG_OUT.mkdir(exist_ok=True)
    logo, logo_mark = logo_files()
    cover_photos = []
    for name in COVER_DISHES:
        item = next((i for i in menu if i['name'].lower() == name.lower()), None)
        if item:
            src, _ = photo_source(item)
            if src.exists():
                cover_photos.append((item['name'], prepared_photo(src, 600), photo_key(src), src))
        if len(cover_photos) == 3:
            break
    cover_imgs = ''.join(f'<figure><div class="thumb glass"><img src="img/{p.name}" alt=""></div><figcaption>{html.escape(n)}</figcaption></figure>'
                         for n, p, _, _ in cover_photos)
    legend = (f'<span>{mark(["veg"])}Veg</span><span>{mark(["egg"])}Egg</span>'
              f'<span>{mark(["chicken"])}Meat or seafood</span>')

    cover = f'''<section class="page cover">
  <div class="kicker">378a Ferry Road &middot; Woolston &middot; Christchurch</div>
  <div class="hero glass">
    <img src="img/{logo_mark.name}" alt="Adipoli Affairs">
    <div class="tag">South Indian Kerala Cuisine</div>
    <div class="rule"></div>
    <div class="menu-word">Menu</div>
  </div>
  <div class="dishes">{cover_imgs}</div>
  <div class="gf glass"><b>Most of our dishes are gluten friendly.</b><br>If you have any concerns, please ask before ordering.</div>
  <div class="info">
    <div class="glass"><b>Find us</b>378a Ferry Road<br>Woolston, Christchurch</div>
    <div class="glass"><b>Open</b>12pm to 9pm<br>Closed Tuesdays</div>
    <div class="glass"><b>Call</b>022 634 0628<br>+64 3 926 3805</div>
    <div class="glass"><b>Online</b>adipoliaffairs.com<br>indianfusionck@gmail.com</div>
  </div>
</section>'''
    back = f'''<section class="page back" id="back">
  <div class="inner"><img src="img/{logo.name}" alt="Adipoli Affairs"></div>
  <div class="cater glass"><span class="chip">Events &middot; Parties &middot; Special occasions</span>
    <h3>Catering and pre-orders</h3>
    <p>We provide catering and pre-orders for events, parties, and special occasions.</p></div>
  <div class="contact">
    <div class="glass"><b>Address</b>378a Ferry Road<br>Woolston, Christchurch</div>
    <div class="glass"><b>Opening hours</b>Open 12pm to 9pm<br>Closed Tuesdays</div>
    <div class="glass"><b>Phone</b>Mobile 022 634 0628<br>Landline +64 3 926 3805</div>
    <div class="glass"><b>Email and web</b>indianfusionck@gmail.com<br>adipoliaffairs.com</div>
  </div>
  <div class="small">
    <div class="legend">{legend}</div>
    All prices in NZD. Most of our dishes are gluten friendly.<br>Please tell us about any allergies or concerns before ordering.
  </div>
</section>'''

    data = {'groups': data_groups, 'heads': heads, 'legend': legend, 'preview': PREVIEW,
            'coverKeys': [k for _, _, k, _ in cover_photos], 'target': TARGET_PAGES}
    data_json = json.dumps(data).replace('</', '<\\/')

    # 1. layout pass
    LAYOUT_OUT.write_text(head_html() + f'''<body><div id="book">{cover}{back}</div>
<script type="application/json" id="data">{data_json}</script>
<script>{JS}</script></body></html>''', encoding='utf-8')
    dom = chrome('--virtual-time-budget=60000', '--dump-dom', LAYOUT_OUT.as_uri()).stdout.decode('utf-8')
    m = re.search(r'<pre id="payload">(.*?)</pre>', dom, flags=re.S)
    if not m:
        sys.exit('Layout pass did not finish (fonts or script did not load).')
    payload = json.loads(html.unescape(m.group(1)))
    pages = payload['pages']
    bad = [k + 1 for k, p in enumerate(pages) if p['overflow']]
    if bad:
        sys.exit(f'Overflow on pages {bad}')

    # 2. backgrounds
    cover_bg = cover_photos[0][3] if cover_photos else None
    final, bg_css = [], []
    for k, p in enumerate(pages):
        photo = cover_bg if p['kind'] == 'cover' else (ROOT / p['photo'] if p['photo'] else None)
        sig = hashlib.md5(json.dumps([p['rects'], str(photo), p['kind'], k, BG_DPI, 4]).encode()).hexdigest()[:10]
        out = IMG_OUT / f'bg-{k + 1:02d}-{sig}.jpg'
        if not out.exists():
            for old in IMG_OUT.glob(f'bg-{k + 1:02d}-*.jpg'):
                old.unlink()
            render_background(out, 1000 + k * 7, [tuple(r) for r in p['rects']], photo, p['kind'])
        # background goes in a per-page class: the page element already has its own style attribute
        final.append(p['html'].replace('<section class="page', f'<section class="pg{k + 1} page', 1))
        bg_css.append(f'.pg{k + 1} {{ background-image: url(img/{out.name}); }}')

    # 3. static pages
    doc = head_html(' '.join(bg_css)) + f'<body><div id="book">{"".join(final)}</div></body></html>'
    print(f'{total} dishes, {new_count} with new photos, {total - new_count} with website photos')
    print(f'{len(pages)} pages (spacing per menu {payload["gaps"]} mm, content pages {payload["target"]}, '
          f'fewest possible {[c[0] for c in payload["counts"]]})')
    if PREVIEW:
        PREVIEW_OUT.write_text(doc, encoding='utf-8')
        print(f'Preview: {PREVIEW_OUT}')
        return
    HTML_OUT.write_text(doc, encoding='utf-8')
    chrome('--no-pdf-header-footer', '--virtual-time-budget=30000', f'--print-to-pdf={PDF_OUT}', HTML_OUT.as_uri())
    print(f'PDF: {PDF_OUT}')


if __name__ == '__main__':
    build()

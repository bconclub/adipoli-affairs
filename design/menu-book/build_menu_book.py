"""Builds the Adipoli Affairs printed menu book (A4 PDF) from the live menu.

Design follows the old printed menu: dark chalkboard pages, orange and yellow
accents, caps dish names with dotted leaders to prices and a short description
under each. Photos are small round accents in centred rows, never the main thing.

Front of the book: a Kerala artwork cover (the restaurant's own illustrations
from the old printed menu, kept in design/menu-book/art) and the signature dishes
page. Then Lunch, Dinner and All Day, an optional story page (only used when the
book needs a page to land on 12 or 16) and the back page with catering and contacts.

Every page is a fixed 210x297mm box. The dishes are written once into a hidden
source list; a small script in the page lays each menu group out at a range of
dish spacings, chooses the book length (12 or 16 pages, a stapled booklet needs a
multiple of 4) and spreads each group evenly over its pages. A unit is a heading
plus its first dishes (headings never sit alone at a page bottom) or a single
dish, so no dish is ever split across pages. About one dish in three or four per
section shows a small round photo at the start of its own entry; every dish's text
starts at the same column, so entries without a photo line up with those that have one.

Photo for each dish: the new menu photo in design/menu-photos if one exists,
otherwise the dish's current website photo. Re-run whenever new photos arrive.

(The frosted-glass variant tried on 10 Nov is kept in build_menu_book_glass.py.)

Usage (from the project root):
  python design/menu-book/build_menu_book.py            -> Adipoli-Menu-Book.pdf
  python design/menu-book/build_menu_book.py --preview  -> design/menu-book/index.html
"""
import hashlib
import html
import json
import re
import subprocess
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
MENU = HERE / 'menu-live.json'
ART = HERE / 'art'
NEW_PHOTOS = ROOT / 'design' / 'menu-photos'
IMG_OUT = HERE / 'img'
HTML_OUT = HERE / 'menu-book.html'
PDF_OUT = ROOT / 'Adipoli-Menu-Book.pdf'
CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
# --preview: label new ChatGPT photos and skip the PDF, for reviewing progress
PREVIEW = '--preview' in sys.argv
PREVIEW_OUT = HERE / 'index.html'
BOOK_SIZES = [12, 16]     # allowed page counts
FIXED_PAGES = 3           # cover, signature dishes, back (the story page is optional)
DISHES_PER_PHOTO = 3.5    # roughly one dish in three or four shows its photo

GROUPS = [
    ('Lunch Menu', ['Kerala Meals', 'South Specials', 'Combo Specials', 'Biryani']),
    ('Dinner Menu', ['Breads', 'Main Course', 'Sides']),
    ('All Day Menu', ['Kids Corner', 'Desserts', 'Hot Drinks', 'Cool Drinks', 'Juice', 'Milkshake']),
]
# Categories split into Veg / Egg / Chicken ... sub-headings
SPLIT = {'Main Course'}
NOTES = {'Main Course': 'Complimentary rice not included'}
# The website's default signature set (top sellers)
SIGNATURE = ['Chatti biriyani beef', 'Vizhinjam Chicken Fry (Bone-in)', 'Beef roast', 'Masala dosa', 'Pothichoru', 'Kappa fish']

STORY = [
    'India is vast and diverse, every region shaped by its own geography, climate and native ingredients. '
    'Kerala stands out among them. Cradled by the Arabian Sea and rich in tropical green, it is celebrated '
    'around the world for vibrant flavours, fragrant spices and a deep-rooted culinary heritage.',
    'Kerala cooking is built on freshly ground spices, coconut in many forms and produce native to the region. '
    'From coastal dishes scented with curry leaves to slow-cooked meats layered with complex spice blends, '
    'the food carries centuries of tradition and craft. In Kerala, cooking is more than a skill; it is a cultural identity.',
    'At Adipoli Affairs we bring that authenticity to Christchurch. All our chefs are natives of Kerala, with years '
    'of experience in traditional cooking passed down through generations, so every dish carries the true taste of '
    'Kerala\u2019s world-renowned cuisine.',
]
GLUTEN = 'Most of our dishes are gluten friendly. If you have any concerns, please ask before ordering.'

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


def board_texture():
    """Dark chalkboard background, one image shared by every page."""
    out = IMG_OUT / 'board.jpg'
    if out.exists():
        return out
    import numpy as np
    rng = np.random.default_rng(7)
    w, h = 1240, 1754  # A4 at 150 dpi
    smudge = Image.fromarray((rng.random((28, 20)) * 255).astype('uint8')).resize((w, h), Image.BICUBIC)
    smudge = np.asarray(smudge, dtype=np.float32) / 255 - .5
    grain = rng.normal(0, 1, (h, w)).astype(np.float32)
    lum = 34 + smudge * 14 + grain * 3.2
    rgb = np.stack([lum, lum * .97, lum * .94], axis=-1).clip(0, 255).astype('uint8')
    Image.fromarray(rgb).save(out, 'JPEG', quality=70, optimize=True)
    return out


def logo_files():
    """Full logo, and the logo without its small tagline (the tagline is set as text where needed).

    Prefers the logo from the old printed menu's cover, rendered from its vector artwork at
    800 dpi with the flat page background keyed out (art/logo-oldmenu-full.png and
    art/logo-oldmenu-mark.png, about 3500px wide); falls back to the website PNG, which is
    only 344px wide."""
    old_full, old_mark = ART / 'logo-oldmenu-full.png', ART / 'logo-oldmenu-mark.png'
    if old_full.exists() and old_mark.exists():
        full, mark_only = IMG_OUT / old_full.name, IMG_OUT / old_mark.name
        full.write_bytes(old_full.read_bytes())
        mark_only.write_bytes(old_mark.read_bytes())
        return full, mark_only
    src = Image.open(ROOT / 'public' / 'Adipoli Logo V1.png').convert('RGBA')
    full, mark_only = IMG_OUT / 'logo.png', IMG_OUT / 'logo-mark.png'
    # The source is small (344px), so upscale it smoothly for print
    big = src.resize((src.width * 4, src.height * 4), Image.LANCZOS)
    big.crop(big.getbbox()).save(full)
    top = src.crop((0, 0, src.width, 111))
    top = top.resize((top.width * 4, top.height * 4), Image.LANCZOS)
    top.crop(top.getbbox()).save(mark_only)
    return full, mark_only


def art_files():
    """Old-menu artwork copied next to the page so relative paths work in Chrome.

    Cutout PNGs are trimmed to their solid pixels (alpha above 40): some carry a faint
    shadow or transparent margin (the auto has ~9% empty space under its wheels), which
    would make a figure float above the line it is placed on."""
    names = {}
    for f in ART.iterdir():
        out = IMG_OUT / f'art-{f.name}'
        if not out.exists() or out.stat().st_mtime < f.stat().st_mtime or out.stat().st_mtime < Path(__file__).stat().st_mtime:
            if f.suffix.lower() == '.png' and not f.stem.startswith('logo'):
                im = Image.open(f).convert('RGBA')
                solid = im.getchannel('A').point(lambda v: 255 if v > 40 else 0)
                im.crop(solid.getbbox()).save(out, optimize=True)
            else:
                out.write_bytes(f.read_bytes())
        names[f.stem] = f'img/{out.name}'
    return names


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


def by_price(dishes):
    """Menu order within a section: cheapest first. Half/full dishes sort by their lower price;
    equal prices by name A to Z. Shared by the book and the takeaway card."""
    return sorted(dishes, key=lambda d: (min(float(v) for _, v in d['prices']), d['name'].lower()))


def clean_desc(item, cat):
    desc = (item.get('desc') or '').strip()
    if cat in NOTES:
        desc = desc.replace(NOTES[cat] + '.', '').strip()
    return desc


def tabular(text):
    """Each digit and the decimal point in its own fixed-width cell (centred, like true tabular
    figures), so decimal points and price edges line up: Poppins' digits differ in width."""
    return ''.join(c if c == '$' else f'<i class="pt">{c}</i>' if c == '.' else f'<i>{c}</i>' for c in text)


def prices_html(item):
    return ''.join(f'<span class="p">{f"<em>{label}</em>" if label else ""}{tabular(price(value))}</span>'
                   for label, value in item['prices'])


def dish_html(item, cat, with_photo=False):
    """One dish entry. The photo column is always there so every entry's text lines up."""
    types = sorted(dish_types(item), key=ORDER.index)
    pic = ''
    if with_photo:
        src, is_new = photo_source(item)
        img = prepared_photo(src, 400)
        pic = f'<img src="img/{img.name}" alt="">' + ('<span class="new">New</span>' if PREVIEW and is_new else '')
    desc = html.escape(clean_desc(item, cat))
    return (f'<div class="dish{" ph" if with_photo else ""}"><div class="pic">{pic}</div><div class="txt">'
            f'<div class="line">{mark(types)}<h4>{html.escape(item["name"])}</h4><span class="dots"></span>'
            f'<span class="price">{prices_html(item)}</span></div>'
            f'{f"<p>{desc}</p>" if desc else ""}</div></div>')


def pick_photos(run, used):
    """Which dishes of a section show their photo: about one in three or four, spread
    through the section, new menu photos first, never the same picture twice in the book."""
    n = len(run)
    want = round(n / DISHES_PER_PHOTO) if n >= 3 else (1 if n == 2 else 0)
    chosen = set()
    for j in range(want):
        target = (j + .5) * n / want
        options = []
        for i, d in enumerate(run):
            src, is_new = photo_source(d)
            if i in chosen or not src.exists() or photo_key(src) in used:
                continue
            options.append((abs(i + .5 - target) - (0.6 if is_new else 0), i, photo_key(src)))
        # never two photos on neighbouring dishes
        options = [o for o in options if o[1] - 1 not in chosen and o[1] + 1 not in chosen] or options
        if options:
            _, i, key = min(options)
            chosen.add(i)
            used.add(key)
    return chosen


def unit(blocks, cat, group, sub='', starts=''):
    return (f'<div class="unit" data-cat="{html.escape(cat)}" data-sub="{html.escape(sub)}" data-group="{group}" '
            f'data-starts="{starts}">{"".join(blocks)}</div>')


CSS = r'''
@page { size: 210mm 297mm; margin: 0; }
:root { --orange:#e8731a; --yellow:#f6b81c; --ink:#f4efe8; --muted:#cfc6bb; --board:#222020; --map:#f68a32; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin:0; font-family: Poppins, Arial, sans-serif; color: var(--ink); background:#555; }
h2, h3, h4, h5 { margin:0; font-weight: normal; }
#source { position:absolute; left:-9999mm; top:0; width: 178mm; }
.page { width:210mm; height:297mm; position:relative; overflow:hidden; break-after: page; page-break-after: always;
  background: var(--board) url(__BOARD__) center / 210mm 297mm no-repeat; }
.page:last-child { break-after: auto; page-break-after: auto; }
@media screen { .page { margin: 0 auto 8mm; box-shadow: 0 2mm 6mm rgba(0,0,0,.4); } body { padding: 8mm 0; } }
@media print { body { background: none; } }

/* corner leaves */
.leaf { position:absolute; width: 34mm; height: 34mm; color: var(--orange); }
.leaf.tl { top:-3mm; left:-3mm; }
.leaf.br { bottom:-3mm; right:-3mm; transform: rotate(180deg); }
.leaf.tr { top:-3mm; right:-3mm; transform: scaleX(-1); }
.leaf.bl { bottom:-3mm; left:-3mm; transform: scaleY(-1); }

/* menu pages: one full-width column */
.list .col { position:absolute; top: 18mm; bottom: 22mm; left: 16mm; right: 16mm; display:flex; flex-direction:column; }
.group { position:relative; width: 128mm; margin: 0 0 6mm; padding: 4mm 0 4.2mm 6mm; background: var(--orange); color: #1d1a18; border-radius: 0 3mm 3mm 0; }
.group::before { content:""; position:absolute; left:-17mm; top:0; bottom:0; width:19mm; background: var(--orange); }
.even .group { margin-left: auto; border-radius: 3mm 0 0 3mm; }
.even .group::before { left:auto; right:-17mm; }
.group span { display:block; font: 600 8pt Poppins, sans-serif; letter-spacing: .28em; text-transform: uppercase; color:#3a1d06; }
.group h2 { font: 400 38pt/.95 'Bebas Neue', sans-serif; letter-spacing: .03em; margin-top: 1.2mm; }
.cat { display:flex; align-items: baseline; gap: 4mm; margin: 4mm 0 1mm; padding-bottom: 2mm; border-bottom: .5mm solid var(--orange); }
.cat h3 { font: 400 27pt/1 'Bebas Neue', sans-serif; letter-spacing: .04em; color: #fff; }
.cat.cont h3 { font-size: 19pt; }
.cat.cont small { font: 500 8pt Poppins, sans-serif; color: var(--muted); letter-spacing:.12em; text-transform: uppercase; }
.when { margin-left:auto; background: var(--yellow); color:#1d1a18; font: 600 8.5pt Poppins, sans-serif; padding: .7mm 2.6mm; border-radius: 3mm; white-space: nowrap; }
.note { font-size: 8.5pt; color: var(--yellow); font-style: italic; margin: 1mm 0 0; }
.sub { margin: 3.5mm 0 0; display:flex; align-items:center; gap: 3mm; }
.sub h5 { font: 400 16pt/1 'Bebas Neue', sans-serif; letter-spacing: .14em; color: var(--yellow); }
.sub::after { content:""; flex:1; height: .3mm; background: rgba(246,184,28,.45); }
.sub.cont h5::after { content:" (continued)"; font: 500 8pt Poppins, sans-serif; letter-spacing:.08em; color: var(--muted); text-transform:none; }
.unit:first-child > .cat:first-child, .unit:first-child > .group:first-child { margin-top: 0; }

.dish { padding-top: var(--gap, 3mm); display:grid; grid-template-columns: 21mm 1fr; align-items:center; }
.dish .pic { position:relative; }
.dish .pic img { display:block; width: 17mm; height: 17mm; border-radius: 50%; object-fit: cover; border: .7mm solid #f4efe8; box-shadow: 0 0 0 .9mm var(--orange); }
.dish .pic .new { position:absolute; top: -1mm; left: -1mm; background:#fff; color:#000; font-size:6.5pt; padding: .2mm 1.2mm; border-radius: 2mm; font-weight:600; }
.dish.ph + .dish.ph .pic img { box-shadow: 0 0 0 .9mm var(--yellow); }
.cat, .sub, .note { margin-left: 0; }
.dish .line { display:flex; align-items: baseline; gap: 2mm; }
.dish h4 { font: 500 11.5pt/1.25 Poppins, sans-serif; text-transform: uppercase; letter-spacing: .02em; color:#fff; }
.dish .dots { flex:1; border-bottom: .3mm dotted rgba(255,255,255,.28); transform: translateY(-1mm); min-width: 4mm; }
.dish .price, .sig .price { font: 600 11.5pt Poppins, sans-serif; color: var(--yellow); white-space: nowrap; }
.price .p + .p { margin-left: 3mm; }
/* tabular prices: one fixed cell per character (see tabular()) */
.price i { font-style: normal; display: inline-block; width: .66em; text-align: center; }
.price i.pt { width: .3em; }
.price em { font-style: normal; font-weight: 500; font-size: 8pt; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; margin-right: 1.2mm; }
.pair { display:grid; grid-template-columns: 1fr 1fr; column-gap: 12mm; }
.pair .dish p { max-width: none; }
.dish p { margin: .6mm 0 0 5.4mm; max-width: 150mm; font-size: 8.5pt; line-height: 1.38; color: var(--muted); }
.mark { width: 3.4mm; height: 3.4mm; border: .35mm solid; border-radius: .5mm; display:inline-flex; align-items:center; justify-content:center; background:#fff; flex-shrink:0; transform: translateY(.3mm); }
.mark span { width: 1.6mm; height: 1.6mm; border-radius: 50%; }

/* rows of small round photos */
.strip { height: 34mm; flex-shrink: 0; display:flex; justify-content:center; align-items:flex-start; gap: 14mm; padding-top: 4mm; }
.strip.top { padding-top: 3.5mm; height: 33.5mm; }
.strip figure { margin:0; width: 34mm; text-align:center; position:relative; }
.strip img { display:block; margin: 0 auto; width: 22mm; height: 22mm; border-radius: 50%; object-fit: cover; border: .9mm solid #f4efe8; box-shadow: 0 0 0 1.1mm var(--orange); }
.strip figure:nth-child(2n) img { box-shadow: 0 0 0 1.1mm var(--yellow); }
.strip figcaption { margin-top: 2.6mm; font-size: 7.5pt; line-height: 1.3; color: var(--muted); font-style: italic; }
.strip .new { position:absolute; top: 0; left: 0; background:#fff; color:#000; font-size:7pt; padding: .4mm 1.6mm; border-radius: 2mm; font-weight:600; font-style: normal; }

.foot { position:absolute; left: 30mm; right: 30mm; bottom: 9mm; display:flex; justify-content: space-between; align-items:center; font-size: 7.5pt; color: #a9a097; border-top: .25mm solid rgba(255,255,255,.14); padding-top: 2.5mm; }
.foot .legend { display:flex; gap: 4mm; }
.foot .legend span, .back .legend span { display:inline-flex; align-items:center; gap: 1.5mm; }
.foot .num { font: 400 12pt 'Bebas Neue', sans-serif; color: var(--orange); letter-spacing:.1em; }

/* cover: Kerala street artwork */
.cover .top { position:absolute; top: 0; bottom: 116mm; left:0; right:0; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; }
.cover .top img { width: 162mm; display:block; }
.cover .tag { margin-top: 9mm; font: 400 22pt 'Bebas Neue', sans-serif; letter-spacing: .42em; color: var(--yellow); padding-left: .42em; }
.cover .city { margin: 6mm auto 0; display:flex; align-items:center; justify-content:center; gap: 5mm; font: 600 10pt Poppins, sans-serif; letter-spacing: .5em; text-transform: uppercase; color:#fff; }
.cover .city::before, .cover .city::after { content:""; width: 22mm; height: .5mm; background: var(--orange); }
/* painted Kerala scene: full width plus 1.5mm bleed each side, bleeding off the bottom;
   its top third fades into the chalkboard (fade baked into the image) */
.cover .scene { position:absolute; left: -1.5mm; width: 213mm; bottom: -1.5mm; }
.cover .scene img { position:absolute; left: 0; width: 213mm; display:block; }
.cover .s-top { top: 0; }

/* story */
.story .inner { position:absolute; top: 20mm; left: 18mm; right: 18mm; }
.kick { font: 600 8pt Poppins, sans-serif; letter-spacing: .3em; text-transform: uppercase; color: var(--orange); }
.story h2, .sigp h2 { font: 400 46pt/.95 'Bebas Neue', sans-serif; letter-spacing: .03em; color:#fff; margin-top: 2mm; }
.story p { font-size: 10.5pt; line-height: 1.6; color: var(--ink); margin: 0; }
.story .lead { margin-top: 6mm; font-size: 11.5pt; }
.story .row { display:flex; gap: 9mm; margin-top: 7mm; align-items: center; }
.story .map { flex: 0 0 60mm; height: 84mm; border-radius: 5mm; background: var(--map); position:relative; display:flex; align-items:center; justify-content:center; }
.story .map img { height: 68mm; display:block; margin-left: 4mm; }
.story .map span { position:absolute; left: 5mm; bottom: 4mm; font: 400 15pt/1 'Bebas Neue', sans-serif; letter-spacing: .14em; color:#1d1a18; }
.story .row .txt p + p { margin-top: 4.5mm; }
.story .gf { margin-top: 7mm; border: .5mm solid var(--yellow); border-radius: 3mm; padding: 4mm 6mm; display:flex; align-items:center; gap: 4mm; }
.story .gf b { font: 400 20pt/1 'Bebas Neue', sans-serif; letter-spacing:.06em; color: var(--yellow); white-space: nowrap; }
.story .gf span { font-size: 10pt; line-height: 1.45; }
.story .leafimg { position:absolute; left: 0; right: 0; margin: 0 auto; bottom: 10mm; width: 150mm; }

/* signature dishes */
.sigp .inner { position:absolute; top: 18mm; left: 16mm; right: 16mm; bottom: 22mm; }
.sigp .lede { margin-top: 1.5mm; font-size: 9.5pt; color: var(--muted); }
.sigs { margin-top: 7mm; display:grid; grid-template-columns: 1fr 1fr; gap: 7mm 10mm; }
.sig { text-align:center; }
.sig img { display:block; margin: 0 auto; width: 40mm; height: 40mm; border-radius:50%; object-fit:cover; border: 1.3mm solid #f4efe8; box-shadow: 0 0 0 1.6mm var(--orange), 0 2mm 5mm rgba(0,0,0,.4); }
.sig:nth-child(4n+2) img, .sig:nth-child(4n+3) img { box-shadow: 0 0 0 1.6mm var(--yellow), 0 2mm 5mm rgba(0,0,0,.4); }
.sig h4 { margin-top: 4mm; font: 500 12pt/1.25 Poppins, sans-serif; text-transform: uppercase; letter-spacing: .02em; color:#fff; display:flex; justify-content:center; align-items:center; gap: 2mm; }
.sig .price { display:block; margin-top: .8mm; }
.sig p { margin: 1mm auto 0; max-width: 80mm; font-size: 8.5pt; line-height: 1.38; color: var(--muted); }

/* back */
.back .inner { position:absolute; top: 50mm; left: 22mm; right: 22mm; text-align:center; }
.back .inner img { width: 104mm; }
.back .cater { position:absolute; left:0; right:0; top: 112mm; background: var(--yellow); color:#1d1a18; padding: 9mm 24mm; text-align:center; }
.back .cater h3 { font: 400 32pt/1 'Bebas Neue', sans-serif; letter-spacing: .04em; }
.back .cater p { margin: 2.5mm 0 0; font-size: 11.5pt; font-weight: 500; }
.back .contact { position:absolute; top: 170mm; left: 22mm; right: 22mm; display:grid; grid-template-columns: 1fr 1fr; gap: 8mm 10mm; font-size: 10.5pt; line-height: 1.5; }
.back .contact b { display:block; font: 400 13pt 'Bebas Neue', sans-serif; letter-spacing: .16em; color: var(--orange); margin-bottom: .8mm; }
.back .small { position:absolute; left: 22mm; right: 22mm; bottom: 20mm; text-align:center; font-size: 8.5pt; color: var(--muted); line-height: 1.6; }
.back .legend { display:flex; justify-content:center; gap: 6mm; margin-bottom: 3mm; color: var(--ink); }
.overflow { outline: 3mm solid red; }
'''

JS = r'''
const D = JSON.parse(document.getElementById('data').textContent);
const MM = 96 / 25.4;
const make = s => { const t = document.createElement('template'); t.innerHTML = s.trim(); return t.content.firstElementChild; };
async function paginate() {
  await document.fonts.ready;
  await Promise.all(['500 11.5pt Poppins', '400 8.5pt Poppins', '600 11.5pt Poppins', "27pt 'Bebas Neue'"]
    .map(f => document.fonts.load(f).catch(() => null)));
  const book = document.getElementById('book'), back = document.getElementById('back');
  let story = document.getElementById('story');
  const tpl = document.getElementById('tpl').content.firstElementChild;
  const units = [...document.querySelectorAll('#source > .unit')].map(u => ({ html: u.outerHTML, ...u.dataset }));
  const groups = [];
  units.forEach(u => { (groups[+u.group] = groups[+u.group] || []).push(u); });

  const fits = col => col.scrollHeight <= col.clientHeight + 0.5;
  function contHead(u) {
    if (u.starts === 'group' || u.starts === 'cat') return null;
    return make(`<div class="unit"><div class="cat cont"><h3>${u.cat}</h3><small>continued</small></div>` +
      (u.sub && u.starts !== 'sub' ? `<div class="sub cont"><h5>${u.sub}</h5></div>` : '') + '</div>');
  }
  // Lay one group out at dish spacing g (mm); returns its pages, attached before the back page
  function layout(gUnits, g) {
    const pages = [];
    let col = null;
    const newPage = () => {
      const p = tpl.cloneNode(true);
      p.style.setProperty('--gap', g + 'mm');
      book.insertBefore(p, story || back); pages.push(p);
      col = p.querySelector('.col');
    };
    for (const u of gUnits) {
      if (!col) newPage();
      const el = make(u.html);
      col.appendChild(el);
      if (!fits(col)) {
        el.remove(); newPage();
        const h = contHead(u); if (h) col.appendChild(h);
        col.appendChild(el);
        if (!fits(col)) { pages[pages.length - 1].classList.add('overflow'); console.error('OVERFLOW', u.cat); }
      }
    }
    return pages;
  }
  const clear = ps => ps.forEach(p => p.remove());
  const GAPS = []; for (let g = 1.4; g <= 6.01; g += 0.2) GAPS.push(+g.toFixed(1));
  const counts = groups.map(gu => GAPS.map(g => { const ps = layout(gu, g); const n = ps.length; clear(ps); return n; }));
  const fewest = counts.map(c => Math.min(...c));
  const minTotal = fewest.reduce((a, b) => a + b, 0);
  const size = D.sizes.find(s => s - D.fixed >= minTotal) || D.sizes[D.sizes.length - 1];
  // The story page is only used to take up a page the menu would otherwise have to stretch over
  const useStory = size - D.fixed - minTotal >= 2;
  if (!useStory) { story.remove(); story = null; }
  const menuPages = size - D.fixed - (useStory ? 1 : 0);
  const target = fewest.slice();
  let total = minTotal;
  const dens = i => groups[i].length / target[i];
  while (total < menuPages) {
    // one more page for the most crowded group that can still spread onto it
    const order = target.map((_, i) => i).sort((a, b) => dens(b) - dens(a));
    let i = order.find(i => counts[i].includes(target[i] + 1));
    if (i === undefined) i = order[0];   // no spacing reaches it: split the group by count below
    target[i]++; total++;
  }
  // Largest spacing that gives each group its page count (fills its last page best)
  const chosen = counts.map((c, i) => { let best = null; GAPS.forEach((g, k) => { if (c[k] === target[i]) best = g; }); return best; });

  const allPages = [];
  let k = 0;
  groups.forEach((gu, i) => {
    let ps;
    if (chosen[i] !== null) ps = layout(gu, chosen[i]);
    else {
      // more pages wanted than spacing gives: split the group's units evenly by count
      ps = layout(gu, GAPS[GAPS.length - 1]);
      while (ps.length < target[i]) {
        clear(ps);
        ps = [];
        const per = Math.ceil(gu.length / target[i]);
        for (let s = 0; s < gu.length; s += per) {
          const part = layout(gu.slice(s, s + per), GAPS[GAPS.length - 1]);
          // continuation heading for a part that starts mid-section
          const first = gu[s], h = s > 0 ? contHead(first) : null;
          if (h) part[0].querySelector('.col').prepend(h);
          ps.push(...part);
        }
        break;
      }
    }
    for (const p of ps) { allPages.push({ p, g: chosen[i] ?? GAPS[GAPS.length - 1], k: k++ }); }
  });

  const bottomOf = col => { const l = col.lastElementChild; return l ? l.getBoundingClientRect().bottom : col.getBoundingClientRect().top; };
  const fill = col => (bottomOf(col) - col.getBoundingClientRect().top) / col.clientHeight;
  const fills = [];
  for (const { p, g } of allPages) {
    const col = p.querySelector('.col');
    // Spread what is left between the dishes
    const n = col.querySelectorAll('.dish').length;
    const spare = (col.getBoundingClientRect().bottom - bottomOf(col)) / MM;
    if (spare > 0 && n) {
      p.style.setProperty('--gap', (g + Math.min((spare - 0.5) / n, 4.5)).toFixed(2) + 'mm');
      if (!fits(col)) p.style.setProperty('--gap', g + 'mm');
    }
    if (!fits(col)) { p.classList.add('overflow'); console.error('OVERFLOW', p.querySelector('h3') && p.querySelector('h3').textContent); }
    fills.push(Math.round(fill(col) * 100));
  }
  // Number pages and set odd / even details
  [...book.querySelectorAll('.page')].forEach((p, i) => {
    const n = i + 1;
    p.classList.add(n % 2 ? 'odd' : 'even');
    const num = p.querySelector('.num'); if (num) num.textContent = String(n).padStart(2, '0');
    if (p.classList.contains('list')) {
      const leafs = p.querySelectorAll('.leaf');
      if (leafs.length === 2) { leafs[0].className = 'leaf ' + (n % 2 ? 'tl' : 'tr'); leafs[1].className = 'leaf ' + (n % 2 ? 'br' : 'bl'); }
    }
  });
  document.getElementById('source').remove();
  await Promise.all([...document.images].map(i => i.complete ? null : new Promise(r => { i.onload = i.onerror = r; })));
  document.body.dataset.pages = book.querySelectorAll('.page').length;
  document.body.dataset.fills = fills.join(',');
  document.body.dataset.gaps = chosen.join(',');
  document.body.classList.add('ready');
}
paginate();
'''

PALMS_SVG = '''<svg viewBox="0 0 210 120" width="100%" height="100%" preserveAspectRatio="xMidYMax meet" fill="currentColor">
<g id="palm"><path d="M30 120 C31 95 33 70 38 46 L40.5 46.5 C36 70 34.5 95 34 120Z"/>
<path d="M39 46 C30 38 18 37 8 42 C19 40 29 42 39 47Z"/><path d="M39 46 C33 34 22 28 12 28 C23 32 32 38 39 47Z"/>
<path d="M39 46 C40 34 36 24 29 17 C35 26 37 36 39 47Z"/><path d="M39 46 C46 36 56 32 66 33 C55 35 47 39 39 47Z"/>
<path d="M39 46 C49 41 60 42 69 49 C59 45 49 45 39 47Z"/><path d="M39 46 C44 33 52 26 61 23 C53 29 46 37 39 47Z"/></g>
<use href="#palm" transform="translate(150 6) scale(.9)"/><use href="#palm" transform="translate(-16 22) scale(.8)"/>
<use href="#palm" transform="translate(178 30) scale(.7)"/></svg>'''

SCENE = 'adipoli-cover-collage-v1.png'   # painted Kerala scene for the bottom of the cover
SCENE_WIDTH_MM = 213                       # 210mm plus 1.5mm bleed each side
SCENE_FADE = 1 / 3                         # transparent at the top, opaque a third of the way down


def cover_scene():
    """The cover illustration, upscaled 2x (Lanczos plus a light unsharp mask) with a soft
    fade baked into its top third so its dark sky melts into the chalkboard.

    Written as two pieces to keep the PDF small: a PNG strip with the fade (alpha) and an
    opaque JPEG for the rest; they overlap by a few rows so there is no seam.
    Returns (top_png, bottom_jpg, split_fraction, top_fraction)."""
    from PIL import ImageFilter
    import numpy as np
    src = ART / SCENE
    top_out, bot_out = IMG_OUT / 'cover-scene-top.png', IMG_OUT / 'cover-scene-bottom.jpg'
    im = Image.open(src).convert('RGB')
    W, H = im.width * 2, im.height * 2
    fade_rows = round(H * SCENE_FADE)
    top_rows = fade_rows + 12
    if not (top_out.exists() and bot_out.exists()) or min(top_out.stat().st_mtime, bot_out.stat().st_mtime) < max(
            src.stat().st_mtime, Path(__file__).stat().st_mtime):
        big = im.resize((W, H), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=1.6, percent=55, threshold=2))
        t = np.clip(np.arange(top_rows) / fade_rows, 0, 1)
        ramp = t * t * (3 - 2 * t)                                   # smoothstep, no hard start or end
        rng = np.random.default_rng(3)
        alpha = np.clip(ramp[:, None] * 255 + rng.uniform(-.8, .8, (top_rows, W)), 0, 255).astype('uint8')
        top = big.crop((0, 0, W, top_rows)).convert('RGBA')
        top.putalpha(Image.fromarray(alpha, 'L'))
        top.save(top_out, optimize=True)
        big.crop((0, fade_rows, W, H)).save(bot_out, 'JPEG', quality=90, optimize=True, subsampling=0)
    return top_out, bot_out, fade_rows / H, top_rows / H


# Orange leaf sprig for page corners (like the old printed menu)
LEAF_SVG = '''<svg viewBox="0 0 100 100" width="100%" height="100%" fill="currentColor">
<path d="M4 4 C30 18 52 38 70 70" stroke="currentColor" stroke-width="2.4" fill="none"/>
<path d="M18 12 C14 26 18 40 30 46 C34 32 30 20 18 12Z"/>
<path d="M18 12 C30 8 44 10 50 20 C38 26 26 22 18 12Z" opacity=".85"/>
<path d="M38 28 C32 42 36 58 50 64 C54 48 50 36 38 28Z"/>
<path d="M38 28 C52 24 66 28 72 40 C58 46 46 40 38 28Z" opacity=".85"/>
<path d="M56 50 C52 62 56 74 66 80 C70 68 66 56 56 50Z"/>
<path d="M56 50 C68 48 78 54 82 64 C70 68 62 62 56 50Z" opacity=".85"/>
</svg>'''


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

    # Signature dish photos are shown big on page 2, so menu entries use other pictures
    used_photos = set()
    for name in SIGNATURE:
        entries = [i for i in menu if base_name(i['name']).lower() == name.lower()]
        if entries and photo_source(entries[0])[0].exists():
            used_photos.add(photo_key(photo_source(entries[0])[0]))

    units, total, new_count = [], 0, 0
    for gi, (title, cats) in enumerate(groups):
        group_head = f'<div class="group"><span>Adipoli Affairs</span><h2>{html.escape(title)}</h2></div>'
        first_in_group = True
        for cat in cats:
            items = by_cat.get(cat, [])
            if not items:
                continue
            total += len(items)
            new_count += sum(photo_source(i)[1] for i in items)
            dishes = by_price(merge_sizes(items))
            times = items[0].get('timeRestriction')
            when = f'<span class="when">{clock(times["start"])} to {clock(times["end"])}</span>' if times else ''
            head = [group_head] if first_in_group else []
            head.append(f'<div class="cat"><h3>{html.escape(cat)}</h3>{when}</div>')
            if cat in NOTES:
                head.append(f'<div class="note">{html.escape(NOTES[cat])}</div>')
            starts = 'group' if first_in_group else 'cat'
            first_in_group = False

            if cat in SPLIT:
                parts = {}
                for d in dishes:
                    parts.setdefault(sorted(dish_types(d), key=ORDER.index)[-1], []).append(d)
                runs = [(LABELS[k], parts[k]) for k in ORDER if k in parts]
            else:
                runs = [('', dishes)]

            for sub, run in runs:
                with_photo = pick_photos(run, used_photos)
                html_dishes = [dish_html(d, cat, i in with_photo) for i, d in enumerate(run)]
                if sub:
                    head.append(f'<div class="sub"><h5>{sub}</h5></div>')
                # Heading travels with its first two dishes, and the last two dishes stay together
                rest = html_dishes[2:]
                units.append(unit(head + html_dishes[:2] + (rest if len(rest) < 2 else []), cat, gi, sub, starts))
                if len(rest) >= 2:
                    units += [unit([d], cat, gi, sub) for d in rest[:-2]]
                    units.append(unit(rest[-2:], cat, gi, sub))
                head, starts = [], 'sub'

    IMG_OUT.mkdir(exist_ok=True)
    board = board_texture()
    logo, logo_mark = logo_files()
    art = art_files()
    legend = (f'<span>{mark(["veg"])}Veg</span><span>{mark(["egg"])}Egg</span>'
              f'<span>{mark(["chicken"])}Meat or seafood</span>')
    foot = f'<div class="foot"><div class="legend">{legend}</div><div>adipoliaffairs.com</div><div class="num"></div></div>'
    leaf = LEAF_SVG

    # Signature dishes: bigger photos, still listed in their own sections too
    sig_cards, sig_keys = [], []
    for name in SIGNATURE:
        entries = [i for i in menu if base_name(i['name']).lower() == name.lower()]
        if not entries:
            print(f'Signature dish not on the menu: {name}')
            continue
        item = merge_sizes(entries)[0]
        cat = entries[0]['category']
        src, _ = photo_source(entries[0])
        img = prepared_photo(src, 900) if src.exists() else None
        if src.exists():
            sig_keys.append(photo_key(src))
        desc = clean_desc(item, cat)
        sig_cards.append(
            f'<div class="sig">{f"<img src=\"img/{img.name}\" alt=\"\">" if img else ""}'
            f'<h4>{mark(sorted(dish_types(item), key=ORDER.index))}{html.escape(item["name"])}</h4>'
            f'<span class="price">{prices_html(item)}</span>'
            f'{f"<p>{html.escape(desc)}</p>" if desc else ""}</div>')

    scene_top, scene_bot, split, top_part = cover_scene()
    scene_h = SCENE_WIDTH_MM * 1024 / 1536
    cover = f'''<section class="page cover">
  <div class="leaf tl">{leaf}</div><div class="leaf tr">{leaf}</div>
  <div class="top">
    <img src="img/{logo_mark.name}" alt="Adipoli Affairs">
    <div class="tag">South Indian Kerala Cuisine</div>
    <div class="city">Christchurch</div>
  </div>
  <div class="scene" style="height: {scene_h:.2f}mm">
    <img class="s-bot" src="img/{scene_bot.name}" alt="" style="top: {split * scene_h:.3f}mm; height: {(1 - split) * scene_h:.3f}mm">
    <img class="s-top" src="img/{scene_top.name}" alt="" style="height: {top_part * scene_h:.3f}mm">
  </div>
</section>'''
    story = f'''<section class="page story" id="story">
  <div class="leaf tr">{leaf}</div>
  <div class="inner">
    <div class="kick">Our story</div>
    <h2>The taste of Kerala</h2>
    <p class="lead">{html.escape(STORY[0])}</p>
    <div class="row"><div class="map"><img src="{art['kerala-map']}" alt="Kerala"><span>Kerala</span></div>
      <div class="txt"><p>{html.escape(STORY[1])}</p><p>{html.escape(STORY[2])}</p></div></div>
    <div class="gf"><b>Gluten friendly</b><span>{html.escape(GLUTEN)}</span></div>
  </div>
  <img class="leafimg" src="{art['sadhya-leaf']}" alt="">
</section>'''
    signature = f'''<section class="page sigp">
  <div class="leaf"></div><div class="leaf"></div>
  <div class="inner">
    <div class="kick">Our most-loved dishes</div>
    <h2>Signature dishes</h2>
    <div class="lede">The dishes our guests order most. You will also find them in their sections of the menu.</div>
    <div class="sigs">{''.join(sig_cards)}</div>
  </div>
  {foot}
</section>'''
    back = f'''<section class="page back" id="back">
  <div class="leaf tl">{leaf}</div><div class="leaf br">{leaf}</div>
  <div class="inner"><img src="img/{logo.name}" alt="Adipoli Affairs"></div>
  <div class="cater"><h3>Catering and pre-orders</h3><p>We provide catering and pre-orders for events, parties, and special occasions.</p></div>
  <div class="contact">
    <div><b>Address</b>378a Ferry Road<br>Woolston, Christchurch</div>
    <div><b>Opening hours</b>Open 12pm to 9pm<br>Closed Tuesdays</div>
    <div><b>Phone</b>Mobile 022 634 0628<br>Landline +64 3 926 3805</div>
    <div><b>Email and web</b>indianfusionck@gmail.com<br>adipoliaffairs.com</div>
  </div>
  <div class="small">
    <div class="legend">{legend}</div>
    All prices in NZD. Most of our dishes are gluten friendly.<br>Please tell us about any allergies or concerns before ordering.
  </div>
</section>'''
    tpl = f'<template id="tpl"><section class="page list"><div class="leaf">{leaf}</div><div class="leaf">{leaf}</div><div class="col"></div>{foot}</section></template>'
    # signature page leaves need the svg too
    signature = signature.replace('<div class="leaf"></div><div class="leaf"></div>', f'<div class="leaf tr">{leaf}</div><div class="leaf bl">{leaf}</div>')

    data = json.dumps({'preview': PREVIEW, 'sigKeys': sig_keys, 'sizes': BOOK_SIZES, 'fixed': FIXED_PAGES}).replace('</', '<\\/')
    css = CSS.replace('__BOARD__', f'img/{board.name}')
    page = f'''<!doctype html>
<html><head><meta charset="utf-8"><title>Adipoli Affairs Menu</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Poppins:wght@400;500;600&display=block" rel="stylesheet">
<style>{css}</style></head><body>
<div id="book">{cover}{signature}{story}{back}</div>
{tpl}
<div id="source">{''.join(units)}</div>
<script type="application/json" id="data">{data}</script>
<script>{JS}</script>
</body></html>'''
    print(f'{total} dishes, {new_count} with new photos, {total - new_count} with website photos')
    if PREVIEW:
        PREVIEW_OUT.write_text(page, encoding='utf-8')
        print(f'Preview: {PREVIEW_OUT}')
        return
    HTML_OUT.write_text(page, encoding='utf-8')
    subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--no-pdf-header-footer',
                    '--run-all-compositor-stages-before-draw', '--virtual-time-budget=60000',
                    f'--print-to-pdf={PDF_OUT}', HTML_OUT.as_uri()],
                   check=True, capture_output=True, timeout=300)
    # Report the layout the page script chose (pages, fill per menu page)
    dom = subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--virtual-time-budget=60000', '--dump-dom',
                          HTML_OUT.as_uri()], capture_output=True, timeout=300).stdout.decode('utf-8', 'replace')
    pages = re.search(r'data-pages="(\d+)"', dom)
    fills = re.search(r'data-fills="([\d,]*)"', dom)
    if pages and fills:
        print(f'{pages.group(1)} pages, menu page fill %: {fills.group(1)}')
    if re.search(r'class="[^"]*overflow', dom):
        sys.exit('A page overflowed: see menu-book.html')
    print(f'PDF: {PDF_OUT}')


if __name__ == '__main__':
    build()

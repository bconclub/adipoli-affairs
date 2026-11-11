"""Builds the Adipoli Affairs takeaway menu card: A4 landscape, double-sided,
folded into a roll-fold tri-fold with three 99 x 210 mm (DL) panels.

Same brand, data and dish rules as the menu book (build_menu_book.py): chalkboard
background, orange accents, Bebas Neue and Poppins, the logo and the Kerala
artwork from the old printed menu. Dish name and price only, with the Veg / Egg /
Meat dot; Mains grouped by Veg, Egg, Chicken, Beef, Mutton and Seafood.

Imposition (as printed, left to right):
  page 1, outside: inside flap | back panel (how to order) | front cover
  page 2, inside:  menu panel 1 | menu panel 2 | menu panel 3
The menu (Lunch, Dinner, All Day, in that order) flows across inside panels 1-3
and finishes on the inside flap. Closed, the front cover is on top and the back
panel underneath; opening the cover shows panel 1 beside the flap, and unfolding
the flap shows the three inside panels.

Text keeps 3 mm clear of every fold line and 5 mm (8 mm in practice) from the
page edges. A small script picks the largest text size (9pt down to 8pt) at which
every panel fits, then evens out the spacing.

Usage (from the project root):
  python design/menu-book/build_takeaway.py            -> Adipoli-Takeaway-Menu.pdf
  python design/menu-book/build_takeaway.py --preview  -> design/menu-book/takeaway.html (no PDF)
"""
import html
import json
import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_menu_book as book  # noqa: E402  (same data, dish types, logo and artwork)

HERE = book.HERE
HTML_OUT = HERE / 'takeaway.html'
PDF_OUT = book.ROOT / 'Adipoli-Takeaway-Menu.pdf'
PREVIEW = '--preview' in sys.argv

# Card wording for some section names
CARD_NAMES = {'Main Course': 'Mains', 'Juice': 'Juices', 'Milkshake': 'Milkshakes'}
NOTES = {'Main Course': 'Complimentary rice not included'}
ORDER_ONLINE = ['order.sipocloudpos.com/adipoli-affairs', 'adipoliaffairs.com']
# Short drink names sit two to a line
PAIRED = {'Hot Drinks', 'Juice', 'Milkshake'}


def dish_row(item):
    types = sorted(book.dish_types(item), key=book.ORDER.index)
    return (f'<div class="dish"><span class="name">{book.mark(types)}<b>{html.escape(item["name"])}</b></span>'
            f'<span class="dots"></span><span class="price">{book.prices_html(item)}</span></div>')


def unit(blocks, cat, sub='', starts=''):
    return (f'<div class="unit" data-cat="{html.escape(CARD_NAMES.get(cat, cat))}" data-sub="{html.escape(sub)}" '
            f'data-starts="{starts}">{"".join(blocks)}</div>')


def group_units(title, cats, by_cat):
    """Group band, section headings and dish rows for one menu group, as units that never split."""
    units, count = [], 0
    band = f'<div class="ghead"><h2>{html.escape(title)}</h2><span>Adipoli Affairs</span></div>'
    for cat in cats:
        items = by_cat.get(cat, [])
        if not items:
            continue
        count += len(items)
        dishes = book.merge_sizes(items)
        times = items[0].get('timeRestriction')
        when = f'<span class="when">{book.clock(times["start"])} to {book.clock(times["end"])}</span>' if times else ''
        head = [f'<div class="cat"><h3>{html.escape(CARD_NAMES.get(cat, cat))}</h3>{when}</div>']
        if cat in NOTES:
            head.append(f'<div class="note">{html.escape(NOTES[cat])}</div>')
        if cat in book.SPLIT:
            parts = {}
            for d in dishes:
                parts.setdefault(sorted(book.dish_types(d), key=book.ORDER.index)[-1], []).append(d)
            runs = [(book.LABELS[k], parts[k]) for k in book.ORDER if k in parts]
        else:
            runs = [('', dishes)]
        starts = 'cat'
        if band:
            head.insert(0, band)
            band, starts = '', 'group'
        for sub, run in runs:
            rows = [dish_row(d) for d in run]
            if cat in PAIRED:
                rows = [f'<div class="pair">{"".join(rows[j:j + 2])}</div>' for j in range(0, len(rows), 2)]
            if sub:
                head.append(f'<div class="sub"><h5>{sub}</h5></div>')
            # a heading travels with its first two dishes; the last two stay together
            rest = rows[2:]
            units.append(unit(head + rows[:2] + (rest if len(rest) < 2 else []), cat, sub, starts))
            if len(rest) >= 2:
                units += [unit([r], cat, sub) for r in rest[:-2]]
                units.append(unit(rest[-2:], cat, sub))
            head, starts = [], 'sub'
    return units, count


CSS = r'''
@page { size: 297mm 210mm; margin: 0; }
:root { --orange:#e8731a; --yellow:#f6b81c; --ink:#f4efe8; --muted:#cfc6bb; --board:#222020; --fs: 8.6pt; --gap: .8mm; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin:0; font-family: Poppins, Arial, sans-serif; color: var(--ink); background:#555; }
h2, h3, h5 { margin:0; font-weight: normal; }
#source { position:absolute; left:-9999mm; top:0; }
.sheet { width:297mm; height:210mm; position:relative; overflow:hidden; break-after: page; page-break-after: always;
  background: var(--board) url(__BOARD__) center / cover no-repeat; }
.sheet:last-child { break-after: auto; page-break-after: auto; }
@media screen { .sheet { margin: 0 auto 8mm; box-shadow: 0 2mm 6mm rgba(0,0,0,.4); } body { padding: 8mm 0; }
  .sheet::before, .sheet::after { content:""; position:absolute; top:0; bottom:0; border-left: .3mm dashed rgba(255,255,255,.25); z-index: 5; }
  .sheet::before { left: 99mm; } .sheet::after { left: 198mm; } }
@media print { body { background: none; } }

/* panels: 99mm wide, 8mm from page edges, 6mm from folds (3mm safe area plus margin) */
.panel { position:absolute; top: 0; bottom: 0; width: 99mm; padding: 8mm 6mm; display:flex; flex-direction:column; }
.p1 { left: 0; padding-left: 8mm; } .p2 { left: 99mm; } .p3 { left: 198mm; padding-right: 8mm; }

/* menu panels */
.ghead { flex-shrink:0; background: var(--orange); color:#1d1a18; border-radius: 2.5mm; padding: 1.5mm 4mm 1.6mm; margin: calc(var(--gap) + 2.6mm) 0 1.8mm; display:flex; align-items: baseline; justify-content: space-between; }
.ghead h2 { font: 400 19pt/1 'Bebas Neue', sans-serif; letter-spacing: .04em; }
.pair { display:grid; grid-template-columns: 1fr 1fr; column-gap: 5mm; }
.ghead span { font: 600 6.5pt Poppins, sans-serif; letter-spacing: .22em; text-transform: uppercase; color:#3a1d06; }
.list { flex: 1; min-height: 0; display:flex; flex-direction:column; overflow: visible; }
.cat { display:flex; align-items: baseline; gap: 2.5mm; margin-top: calc(var(--gap) + 2.2mm); padding-bottom: .9mm; border-bottom: .4mm solid var(--orange); }
.list > .unit:first-child > .cat:first-child, .list > .unit:first-child > .ghead:first-child { margin-top: 0; }
.art { display:block; margin: auto auto 0; max-width: 78mm; object-fit: contain; }
.cat h3 { font: 400 calc(var(--fs) * 1.85)/1 'Bebas Neue', sans-serif; letter-spacing: .05em; color:#fff; }
.cat.cont small { font: 500 6.5pt Poppins, sans-serif; color: var(--muted); letter-spacing: .14em; text-transform: uppercase; }
.when { margin-left:auto; background: var(--yellow); color:#1d1a18; font: 600 7pt Poppins, sans-serif; padding: .4mm 2mm; border-radius: 2mm; white-space: nowrap; }
.note { font-size: 7.5pt; color: var(--yellow); font-style: italic; margin-top: .8mm; }
.sub { display:flex; align-items:center; gap: 2mm; margin-top: calc(var(--gap) + 1.2mm); }
.sub h5 { font: 400 calc(var(--fs) * 1.35)/1 'Bebas Neue', sans-serif; letter-spacing: .14em; color: var(--yellow); }
.sub::after { content:""; flex:1; height: .3mm; background: rgba(246,184,28,.5); }
.sub.cont h5::after { content:" (continued)"; font: 500 6.5pt Poppins, sans-serif; letter-spacing: .06em; color: var(--muted); }
.dish { display:flex; align-items: baseline; gap: 1.5mm; padding-top: var(--gap); line-height: 1.15; }
.dish .name { display:flex; align-items: baseline; gap: 1.6mm; min-width: 0; }
.dish b { font: 500 var(--fs)/1.15 Poppins, sans-serif; text-transform: uppercase; letter-spacing: .015em; color:#fff; }
.dish .dots { flex:1; min-width: 3mm; border-bottom: .3mm dotted rgba(255,255,255,.3); transform: translateY(-.7mm); }
.dish .price { font: 700 var(--fs)/1.15 Poppins, sans-serif; color: var(--yellow); white-space: nowrap; }
.price .p + .p { margin-left: 2mm; }
.price em { font-style: normal; font-weight: 500; font-size: 6.5pt; color: var(--muted); text-transform: uppercase; letter-spacing: .05em; margin-right: .8mm; }
.mark { width: 2.7mm; height: 2.7mm; border: .3mm solid; border-radius: .4mm; display:inline-flex; align-items:center; justify-content:center; background:#fff; flex-shrink:0; transform: translateY(.25mm); }
.mark span { width: 1.25mm; height: 1.25mm; border-radius: 50%; }
.art-fill { flex: 1; min-height: 0; display:flex; align-items:flex-end; justify-content:center; padding-top: 3mm; }
.art-fill img { max-width: 78mm; max-height: 100%; object-fit: contain; display:block; }

/* front cover */
.cover { align-items: center; text-align:center; }
.cover .logo { width: 80mm; margin-top: auto; }
.cover .tag { margin-top: 5mm; font: 400 12.5pt 'Bebas Neue', sans-serif; letter-spacing: .32em; color: var(--yellow); padding-left: .32em; }
.cover .rule { width: 26mm; height: .5mm; background: var(--orange); margin: 6mm auto 0; }
.cover .ta { margin-top: 5mm; font: 400 40pt/.95 'Bebas Neue', sans-serif; letter-spacing: .04em; color:#fff; }
.cover .city { margin-top: 2.5mm; font: 600 7.5pt Poppins, sans-serif; letter-spacing: .42em; text-transform: uppercase; color: var(--muted); padding-left: .42em; }
.cover .city + .scene, .cover .scene { position: relative; margin-top: auto; width: 100%; height: 66mm; border-radius: 4mm; background: var(--orange); overflow: hidden; }
.cover .scene .palms { position:absolute; left: 0; right: 0; bottom: 0; height: 80mm; color:#c5560c; }
.cover .scene img { position:absolute; bottom: -1mm; }
/* both figures stand on the bottom edge of the orange box */
.cover .scene .auto { height: 36mm; left: 2mm; }
.cover .scene .woman { height: 52mm; right: 1mm; }

/* back panel */
.back .logo { width: 62mm; align-self: center; margin-top: 2mm; }
.back h3 { margin-top: 6mm; font: 400 22pt/1 'Bebas Neue', sans-serif; letter-spacing: .05em; color:#fff; border-bottom: .4mm solid var(--orange); padding-bottom: 1.2mm; }
.back .blk { margin-top: 4mm; }
.back .lbl { font: 400 11pt/1 'Bebas Neue', sans-serif; letter-spacing: .16em; color: var(--orange); }
.back .big { margin-top: 1.2mm; font: 600 11pt/1.4 Poppins, sans-serif; color:#fff; }
.back .big small { font: 500 7.5pt Poppins, sans-serif; color: var(--muted); letter-spacing: .08em; text-transform: uppercase; margin-right: 2mm; }
.back .txt { margin-top: 1.2mm; font-size: 8.5pt; line-height: 1.5; color: var(--ink); }
.back .web { font-weight: 600; color:#fff; }
.back .cater { margin-top: auto; background: var(--yellow); color:#1d1a18; border-radius: 3mm; padding: 3.5mm 4mm; text-align:center; }
.back .cater b { display:block; font: 400 15pt/1 'Bebas Neue', sans-serif; letter-spacing: .05em; }
.back .cater span { display:block; margin-top: 1mm; font-size: 8pt; line-height: 1.4; font-weight: 500; }
.back .foot { margin-top: 3.5mm; display:flex; justify-content: space-between; align-items:center; font-size: 7pt; color: var(--muted); }
.back .legend { display:flex; gap: 2.5mm; }
.back .legend span { display:inline-flex; align-items:center; gap: 1mm; }
.overflow { outline: 2mm solid red; }
'''

JS = r'''
async function fit() {
  await document.fonts.ready;
  await Promise.all(['500 8.6pt Poppins', '700 8.6pt Poppins', "16pt 'Bebas Neue'"].map(f => document.fonts.load(f).catch(() => null)));
  const make = s => { const t = document.createElement('template'); t.innerHTML = s.trim(); return t.content.firstElementChild; };
  const units = [...document.querySelectorAll('#source > .unit')].map(u => ({ html: u.outerHTML, ...u.dataset }));
  // Reading order of the menu panels: inside left, middle, right, then the flap
  const lists = ['q1', 'q2', 'q3', 'q4'].map(id => document.querySelector(`#${id} .list`));
  const fits = el => el.scrollHeight <= el.clientHeight + 0.5;
  const contHead = u => (u.starts === 'cat' || u.starts === 'group') ? null :
    make(`<div class="unit"><div class="cat cont"><h3>${u.cat}</h3><small>continued</small></div>` +
      (u.sub && u.starts !== 'sub' ? `<div class="sub cont"><h5>${u.sub}</h5></div>` : '') + '</div>');
  function place() {
    lists.forEach(l => { l.innerHTML = ''; l.style.removeProperty('--gap'); });
    let i = 0;
    for (const u of units) {
      const el = make(u.html); lists[i].appendChild(el);
      if (!fits(lists[i])) {
        el.remove();
        if (++i >= lists.length) return false;
        const h = contHead(u); if (h) lists[i].appendChild(h);
        lists[i].appendChild(el);
        if (!fits(lists[i])) return false;
      }
    }
    return true;
  }
  const root = document.documentElement.style;
  let size = null;
  for (let s = 9.0; s >= 7.99; s -= 0.1) {
    root.setProperty('--fs', s.toFixed(1) + 'pt'); root.setProperty('--gap', '.6mm');
    if (place()) { size = s; break; }
  }
  if (size === null) { document.body.classList.add('overflow'); console.error('Card does not fit at 8pt'); }
  const MM = 96 / 25.4;
  const spareOf = l => (l.getBoundingClientRect().bottom - (l.lastElementChild ? l.lastElementChild.getBoundingClientRect().bottom : l.getBoundingClientRect().top)) / MM;
  // Kerala artwork closes the last panel when there is room for it
  const last = lists[lists.length - 1];
  if (spareOf(last) > 34) {
    const img = make(`<img class="art" src="__ART__" alt="">`);
    img.style.maxHeight = Math.min(spareOf(last) - 6, 60).toFixed(1) + 'mm';
    last.appendChild(img);
  }
  // Even out the spacing on each panel
  for (const l of lists) {
    const rows = l.querySelectorAll('.pair, .cat, .sub, .ghead').length + [...l.querySelectorAll('.dish')].filter(d => !d.parentElement.classList.contains('pair')).length;
    const spare = spareOf(l);
    if (spare > 0 && rows && !l.querySelector('.art')) {
      l.style.setProperty('--gap', (0.6 + Math.min((spare - 0.5) / rows, 2.2)).toFixed(2) + 'mm');
      if (!fits(l)) l.style.removeProperty('--gap');
    }
  }
  lists.forEach(l => { if (!fits(l)) l.closest('.panel').classList.add('overflow'); });
  document.getElementById('source').remove();
  await Promise.all([...document.images].map(i => i.complete ? null : new Promise(r => { i.onload = i.onerror = r; })));
  document.body.dataset.size = size;
  document.body.classList.add('ready');
}
fit();
'''


def build():
    menu = json.loads(book.MENU.read_text(encoding='utf-8'))
    menu = menu if isinstance(menu, list) else menu['items']
    by_cat = {}
    for item in menu:
        if item.get('available') is False:
            continue
        by_cat.setdefault(item['category'], []).append(item)
    groups = {title: cats for title, cats in book.GROUPS}
    lunch, n1 = group_units('Lunch Menu', groups['Lunch Menu'], by_cat)
    dinner, n2 = group_units('Dinner Menu', groups['Dinner Menu'], by_cat)
    allday, n3 = group_units('All Day Menu', groups['All Day Menu'], by_cat)
    known = {c for cats in groups.values() for c in cats}
    missing = [c for c in by_cat if c not in known]
    if missing:
        sys.exit(f'Categories not on the card: {missing}')

    book.IMG_OUT.mkdir(exist_ok=True)
    board = book.board_texture()
    logo, logo_mark = book.logo_files()
    art = book.art_files()
    legend = (f'<span>{book.mark(["veg"])}Veg</span><span>{book.mark(["egg"])}Egg</span>'
              f'<span>{book.mark(["chicken"])}Meat or seafood</span>')

    def menu_panel(cls, pid):
        return f'<div class="panel {cls}" id="{pid}"><div class="list"></div></div>'

    outside = f'''<section class="sheet outside">
  <div class="panel p1" id="q4"><div class="list"></div></div>
  <div class="panel p2 back">
    <img class="logo" src="img/{logo.name}" alt="Adipoli Affairs">
    <h3>How to order</h3>
    <div class="blk"><div class="lbl">Call us</div>
      <div class="big"><small>Mobile</small>022 634 0628</div>
      <div class="big"><small>Landline</small>+64 3 926 3805</div></div>
    <div class="blk"><div class="lbl">Order online</div>
      <div class="txt">{''.join(f'<div class="web">{html.escape(u)}</div>' for u in ORDER_ONLINE)}</div></div>
    <div class="blk"><div class="lbl">Visit us</div>
      <div class="txt">378a Ferry Road, Woolston, Christchurch</div></div>
    <div class="blk"><div class="lbl">Hours</div>
      <div class="txt">Open 12pm to 9pm<br>Closed Tuesdays</div></div>
    <div class="cater"><b>Catering and pre-orders</b><span>We provide catering and pre-orders for events, parties, and special occasions.</span></div>
    <div class="foot"><div class="legend">{legend}</div><div>Prices in NZD</div></div>
  </div>
  <div class="panel p3 cover">
    <img class="logo" src="img/{logo_mark.name}" alt="Adipoli Affairs">
    <div class="tag">South Indian Kerala Cuisine</div>
    <div class="rule"></div>
    <div class="ta">Takeaway Menu</div>
    <div class="city">Christchurch</div>
    <div class="scene"><div class="palms">{book.PALMS_SVG}</div>
      <img class="auto" src="{art['auto-driver']}" alt=""><img class="woman" src="{art['woman-dosa']}" alt=""></div>
  </div>
</section>'''
    inside = f'''<section class="sheet inside">
  {menu_panel('p1', 'q1')}
  {menu_panel('p2', 'q2')}
  {menu_panel('p3', 'q3')}
</section>'''
    source = f'<div id="source">{"".join(lunch + dinner + allday)}</div>'
    js = JS.replace('__ART__', art['ksrtc-bus'])
    page = f'''<!doctype html>
<html><head><meta charset="utf-8"><title>Adipoli Affairs Takeaway Menu</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Poppins:wght@400;500;600;700&display=block" rel="stylesheet">
<style>{CSS.replace('__BOARD__', f'img/{board.name}')}</style></head><body>
{outside}
{inside}
{source}
<script>{js}</script>
</body></html>'''
    HTML_OUT.write_text(page, encoding='utf-8')
    print(f'{n1 + n2 + n3} dishes (lunch {n1}, dinner {n2}, all day {n3})')
    if PREVIEW:
        print(f'Preview: {HTML_OUT}')
        return
    subprocess.run([book.CHROME, '--headless=new', '--disable-gpu', '--no-pdf-header-footer',
                    '--run-all-compositor-stages-before-draw', '--virtual-time-budget=40000',
                    f'--print-to-pdf={PDF_OUT}', HTML_OUT.as_uri()], check=True, capture_output=True, timeout=300)
    dom = subprocess.run([book.CHROME, '--headless=new', '--disable-gpu', '--virtual-time-budget=40000', '--dump-dom',
                          HTML_OUT.as_uri()], capture_output=True, timeout=300).stdout.decode('utf-8', 'replace')
    size = re.search(r'data-size="([\d.]+|null)"', dom)
    print(f'Dish text size: {size.group(1) if size else "?"} pt')
    if re.search(r'class="[^"]*\boverflow\b', dom):
        sys.exit('A panel overflowed: see takeaway.html')
    print(f'PDF: {PDF_OUT}')


if __name__ == '__main__':
    build()

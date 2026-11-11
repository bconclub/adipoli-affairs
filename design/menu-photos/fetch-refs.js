// Downloads 2 real reference photos per dish from Bing image search thumbnails
// into refs/raw/<file>-1.jpg and -2.jpg. Slow on purpose to stay polite.
// Usage: node fetch-refs.js prompts.json
const fs = require('fs');
const path = require('path');

const prompts = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const OUT = path.join(__dirname, 'refs', 'raw');
fs.mkdirSync(OUT, { recursive: true });
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
    let ok = 0;
    for (const p of prompts) {
        const base = p.file.replace(/\.png$/, '');
        if (fs.existsSync(path.join(OUT, `${base}-2.jpg`))) { ok++; continue; }
        try {
            const html = await (await fetch(`https://www.bing.com/images/search?q=${encodeURIComponent(p.search)}&form=HDRSC2`, { headers: { 'User-Agent': UA } })).text();
            const thumbs = [...html.matchAll(/turl&quot;:&quot;(https:\/\/ts\d\.mm\.bing\.net\/th\?id=[^&]+)/g)].map(m => m[1]);
            let saved = 0;
            for (const t of thumbs) {
                if (saved >= 2) break;
                const res = await fetch(`${t}&w=600&h=600&c=7`, { headers: { 'User-Agent': UA } });
                const buf = Buffer.from(await res.arrayBuffer());
                if (!res.ok || buf.length < 8000) continue;
                fs.writeFileSync(path.join(OUT, `${base}-${++saved}.jpg`), buf);
            }
            if (saved === 2) ok++; else console.log('only', saved, 'for', p.name);
        } catch (e) {
            console.log('failed', p.name, e.message);
        }
        await sleep(1500);
    }
    console.log(`${ok}/${prompts.length} dishes have 2 references`);
})();

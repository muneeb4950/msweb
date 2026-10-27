// Loads the real pages in jsdom, runs the built bundle, and exercises the widgets.
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const js = fs.readFileSync(new URL('../assets/widgets/widgets.js', import.meta.url), 'utf8');
const page = (p) => fs.readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const tick = () => new Promise((r) => setTimeout(r, 30));
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };

async function boot(file) {
  const dom = new JSDOM(page(file).replace(/<script[^>]*src=[^>]*><\/script>/g, ''), { runScripts: 'outside-only', pretendToBeVisual: true });
  dom.window.eval(js);
  await tick();
  return dom.window;
}
async function type(w, el, value) {
  el.value = value;
  el.dispatchEvent(new w.Event('input', { bubbles: true }));
  await tick();
}

// --- Calculator
let w = await boot('services/pricing/index.html');
const root = w.document.getElementById('ms-cost-calc');
ok(root && root.querySelector('.msw-card'), 'calculator renders on pricing page');
const area = w.document.getElementById('msw-area');
await type(w, area, '2000');
let result = w.document.querySelector('.msw-result-value').textContent;
ok(/50\.0 lakh to 60\.0 lakh/.test(result), `grey 2000 sq ft = 2000x2500..3000 -> "${result}"`);
w.document.querySelector('input[value="premium"]').click(); await tick();
result = w.document.querySelector('.msw-result-value').textContent;
ok(/1\.20 crore to 1\.40 crore\+/.test(result), `premium 2000 sq ft shows open-ended upper bound -> "${result}"`);
await type(w, area, '50');
ok(!!w.document.querySelector('.msw-error'), 'invalid area (50) shows an error and no range');
const href = w.document.querySelector('.msw-btn').getAttribute('href');
ok(href.startsWith('https://wa.me/923061982828?text='), 'WhatsApp link targets the business number');
await type(w, area, '2000');
ok(decodeURIComponent(w.document.querySelector('.msw-btn').getAttribute('href')).includes('2000 sq ft'), 'WhatsApp message carries the entered area');

// --- Area finder
w = await boot('areas/index.html');
ok(!!w.document.querySelector('.msw-finder'), 'area finder renders on areas hub');
const q = w.document.getElementById('msw-area-q');
await type(w, q, 'johar');
const links = [...w.document.querySelectorAll('.msw-matches a')].map((a) => a.getAttribute('href'));
ok(links.includes('/areas/johar-town-lahore/'), `search "johar" finds Johar Town -> ${links.join(', ')}`);
await type(w, q, 'zzzz');
ok(w.document.querySelectorAll('.msw-matches a').length === 0, 'no-match query lists nothing');
const total = Number((w.document.querySelector('.msw-finder .msw-note').textContent.match(/\d+/) || [0])[0]);
await type(w, q, '');
const count = Number((w.document.querySelector('.msw-finder .msw-note').textContent.match(/(\d+) areas/) || [0, 0])[1]);
ok(count >= 80, `finder indexed ${count} areas from the page`);

// --- other pages are untouched by the bundle
w = await boot('index.html');
ok(!w.document.querySelector('.msw-card'), 'homepage has no widget mount, bundle does nothing');
console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED');
process.exit(fails ? 1 : 0);

// Fails if the calculator's rate card drifts from /services/pricing/.
import fs from 'node:fs';
import { SCOPES, RATES_DATE } from './src/rates.js';

const html = fs.readFileSync(new URL('../services/pricing/index.html', import.meta.url), 'utf8');
const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const fmt = (n) => n.toLocaleString('en-US');
let bad = 0;
for (const s of SCOPES) {
  const want = `PKR ${fmt(s.min)} – ${fmt(s.max)}${s.open ? '+' : ''} / sq ft`;
  if (!text.includes(want)) { console.error(`MISMATCH ${s.name}: page lacks "${want}"`); bad++; }
  if (!text.includes(s.covers)) { console.error(`MISMATCH ${s.name}: description differs`); bad++; }
}
if (!text.includes(`Indicative rates as of ${RATES_DATE}`)) { console.error(`MISMATCH date "${RATES_DATE}"`); bad++; }
console.log(bad ? `FAILED (${bad})` : `OK: ${SCOPES.length} scopes and date match the pricing page`);
process.exit(bad ? 1 : 0);

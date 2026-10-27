import { useMemo, useState } from 'react';

// Reads the area cards already on the page, so the list never drifts from the
// real links and the static HTML stays fully crawlable without JavaScript.
function readAreas() {
  const seen = new Map();
  document.querySelectorAll('a[href^="/areas/"]').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === '/areas/' || seen.has(href)) return;
    const h = a.querySelector('h3');
    if (!h) return;
    seen.set(href, h.textContent.trim());
  });
  return [...seen].map(([href, name]) => ({ href, name }));
}

export default function AreaFinder() {
  const areas = useMemo(readAreas, []);
  const [q, setQ] = useState('');
  const term = q.trim().toLowerCase();
  const matches = term ? areas.filter((a) => a.name.toLowerCase().includes(term)).slice(0, 12) : [];

  return (
    <div className="msw-card msw-finder">
      <label className="msw-label" htmlFor="msw-area-q">
        Find your society or neighbourhood
      </label>
      <input
        id="msw-area-q"
        className="msw-input"
        type="search"
        autoComplete="off"
        placeholder="Type a name, e.g. Johar Town"
        value={q}
        onInput={(e) => setQ(e.target.value)}
      />
      <p className="msw-note" aria-live="polite">
        {term
          ? matches.length
            ? `${matches.length} match${matches.length === 1 ? '' : 'es'}`
            : 'No match. Browse the full list below or message us on WhatsApp.'
          : `${areas.length} areas listed below.`}
      </p>
      {matches.length > 0 && (
        <ul className="msw-matches">
          {matches.map((a) => (
            <li key={a.href}>
              <a href={a.href}>{a.name}</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

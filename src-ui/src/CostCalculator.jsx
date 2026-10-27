import { useState } from 'react';
import { SCOPES, RATES_DATE, WHATSAPP } from './rates.js';

const LAKH = 100000;
const CRORE = 10000000;

function money(n) {
  if (n >= CRORE) return `${(n / CRORE).toFixed(2)} crore`;
  return `${(n / LAKH).toFixed(1)} lakh`;
}

export default function CostCalculator() {
  const [area, setArea] = useState('');
  const [scopeId, setScopeId] = useState('grey');
  const scope = SCOPES.find((s) => s.id === scopeId);
  const sqft = Number(area);
  const valid = Number.isFinite(sqft) && sqft >= 100 && sqft <= 100000;
  const low = valid ? sqft * scope.min : 0;
  const high = valid ? sqft * scope.max : 0;

  const message = valid
    ? `Hello, I'd like a free site visit and quote. Covered area about ${sqft} sq ft, scope: ${scope.name}. The pricing page estimate was PKR ${money(low)} to ${money(high)}${scope.open ? '+' : ''}.`
    : "Hello, I'd like a free site visit and quote for my construction project.";
  const waHref = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;

  return (
    <div className="msw-card">
      <h3 className="msw-title">Estimate your cost from our rate card</h3>
      <p className="msw-note">
        Uses the rates published on this page (as of {RATES_DATE}). It is a planning figure, not a quote.
      </p>

      <label className="msw-label" htmlFor="msw-area">
        Covered area to be built (sq ft)
      </label>
      <input
        id="msw-area"
        className="msw-input"
        type="number"
        inputMode="numeric"
        min="100"
        max="100000"
        placeholder="e.g. 2400"
        value={area}
        onInput={(e) => setArea(e.target.value)}
      />
      {area !== '' && !valid && (
        <p className="msw-error" role="alert">
          Enter an area between 100 and 100,000 sq ft.
        </p>
      )}

      <fieldset className="msw-fieldset">
        <legend className="msw-label">Scope</legend>
        <div className="msw-scopes">
          {SCOPES.map((s) => (
            <label key={s.id} className={`msw-scope${s.id === scopeId ? ' is-on' : ''}`}>
              <input
                type="radio"
                name="msw-scope"
                value={s.id}
                checked={s.id === scopeId}
                onChange={() => setScopeId(s.id)}
              />
              <span className="msw-scope-name">{s.name}</span>
              <span className="msw-scope-rate">
                PKR {s.min.toLocaleString('en-US')} to {s.max.toLocaleString('en-US')}
                {s.open ? '+' : ''} / sq ft
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <p className="msw-covers">
        <strong>This scope covers:</strong> {scope.covers}
      </p>

      <div className="msw-result" aria-live="polite">
        {valid ? (
          <>
            <span className="msw-result-label">Indicative range</span>
            <span className="msw-result-value">
              PKR {money(low)} to {money(high)}
              {scope.open ? '+' : ''}
            </span>
          </>
        ) : (
          <span className="msw-result-label">Enter your covered area to see a range.</span>
        )}
      </div>

      <p className="msw-note">
        Anything not named in your written quote is not included. The final figure comes after a free site
        visit and an itemised quote.
      </p>

      <a className="msw-btn" href={waHref} target="_blank" rel="noopener">
        Get an exact quote on WhatsApp
      </a>
    </div>
  );
}

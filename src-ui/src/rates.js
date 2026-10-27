// Source of truth for the calculator: the rate card on /services/pricing/.
// `npm run check` fails if any number or date here stops matching that page.
export const RATES_DATE = 'September 29, 2026';
export const RATES_DATE_ISO = '2026-09-29';

export const SCOPES = [
  {
    id: 'labour',
    name: 'Labour only',
    min: 750,
    max: 900,
    open: false,
    covers: 'Site supervision and construction execution only. You buy all the materials.',
  },
  {
    id: 'grey',
    name: 'Grey structure',
    min: 2500,
    max: 3000,
    open: false,
    covers: 'Foundation, RCC frame, block or brick masonry, roof slabs, plaster and conduit placement.',
  },
  {
    id: 'standard',
    name: 'Standard turnkey',
    min: 4000,
    max: 5500,
    open: false,
    covers: 'Complete grey structure plus standard tiling, basic woodwork, paint and sanitary fixtures.',
  },
  {
    id: 'premium',
    name: 'Premium turnkey',
    min: 6000,
    max: 7000,
    open: true, // the page says "7,000+"
    covers: 'High-end or imported tiles, designer kitchen layouts, premium bathroom fittings and custom finishes.',
  },
];

export const WHATSAPP = '923061982828';

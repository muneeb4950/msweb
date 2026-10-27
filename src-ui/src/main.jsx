import { render } from 'react-dom';
import CostCalculator from './CostCalculator.jsx';
import AreaFinder from './AreaFinder.jsx';
import './widgets.css';

// Each widget mounts only if its placeholder exists on the page.
const mounts = [
  ['ms-cost-calc', CostCalculator],
  ['ms-area-finder', AreaFinder],
];

mounts.forEach(([id, Component]) => {
  const el = document.getElementById(id);
  if (el) render(<Component />, el);
});

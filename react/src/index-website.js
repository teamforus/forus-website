import ReactDOM from 'react-dom/client';
import Website from './website/Website';

// eslint-disable-next-line no-undef
require(`../assets/forus-website/scss/website-vars.scss`);
// eslint-disable-next-line no-undef
require(`../assets/forus-website/scss/website.scss`);

const root = ReactDOM.createRoot(document.getElementById('root'));
// eslint-disable-next-line no-undef
root.render(<Website envData={env_data} />);

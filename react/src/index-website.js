import ReactDOM from 'react-dom/client';
import Website from './website/Website';

require(`../assets/forus-website/scss/website-vars.scss`);
require(`../assets/forus-website/scss/website.scss`);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Website envData={env_data} />);

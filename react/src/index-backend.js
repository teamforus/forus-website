import ReactDOM from 'react-dom/client';
import Backend from './backend/Backend';

require(`../assets/forus-backend/scss/style.scss`);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Backend />);

import ReactDOM from 'react-dom/client';
import Dashboard from './dashboard/Dashboard';
// import '../src/assets/scss/style.scss';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Dashboard envData={env_data} />);

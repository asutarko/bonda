import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ConsentGate } from './components/bonda-compliance.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConsentGate>
      <App />
    </ConsentGate>
  </React.StrictMode>
);

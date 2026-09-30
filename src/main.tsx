import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('TypeQuest: #root element not found in index.html');
}

createRoot(container).render(<App />);

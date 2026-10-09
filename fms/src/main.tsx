import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Apply theme before render to avoid FOUC
try {
  const t = localStorage.getItem('rguhs-fms-theme');
  if (t === 'dark') document.documentElement.classList.add('dark');
  document.documentElement.style.colorScheme = t === 'dark' ? 'dark' : 'light';
} catch (_) {}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

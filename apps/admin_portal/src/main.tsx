import { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
//
import App from './App';
import './index.css'

// ----------------------------------------------------------------------

// Safe error logging & visual crash boundary
window.onerror = (msg, src, line, col, err) => {
  console.error('[AppError]', msg, `${src}:${line}:${col}`, err);
  const rootEl = document.getElementById('root');
  if (rootEl) {
    rootEl.innerHTML = `<div style="padding:40px;font-family:sans-serif;color:#1c1c1c;background:#fff;border:2px solid #ff4d4f;margin:20px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
      <h2 style="margin-top:0;color:#ff4d4f;display:flex;align-items:center;gap:10px;">⚠️ Runtime Exception Detected</h2>
      <p style="font-size:15px;line-height:1.5;">The Tubulu Admin Portal failed to render due to an active runtime or hydration exception. This is usually caused by outdated or malformed session cache states from past backend sessions.</p>
      <div style="background:#fdf2f2;border-left:4px solid #ff4d4f;padding:12px;margin:15px 0;font-family:monospace;font-size:14px;color:#c2410c;">
        <strong>Error:</strong> ${msg}<br/>
        <strong>Source:</strong> ${src}:${line}:${col}
      </div>
      <details style="margin:15px 0;cursor:pointer;">
        <summary style="font-weight:bold;color:#666;">View full technical stack trace</summary>
        <pre style="background:#f4f4f5;padding:15px;border-radius:4px;overflow-x:auto;font-family:monospace;font-size:12px;margin-top:8px;color:#4b5563;">${err?.stack || 'No stack trace details available'}</pre>
      </details>
      <div style="margin-top:25px;">
        <button onclick="localStorage.clear(); sessionStorage.clear(); window.location.reload();" style="padding:12px 24px;background:#ff4d4f;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:bold;font-size:14px;box-shadow:0 2px 4px rgba(255,77,79,0.3);transition:background 0.2s;">
          🧹 Clear Session & Hard Restart Portal
        </button>
      </div>
    </div>`;
  }
};
window.addEventListener('unhandledrejection', (e) => {
  console.error('[UnhandledRejection]', e.reason);
});

try {
  const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
  root.render(
    <HelmetProvider>
      <BrowserRouter>
        <Suspense>
          <App />
        </Suspense>
      </BrowserRouter>
    </HelmetProvider>
  );
} catch (e: any) {
  document.getElementById('root')!.innerHTML = `<div style="padding:40px;font-family:monospace;color:red;background:#fff;"><h2>Fatal Error</h2><pre>${e?.stack || e}</pre></div>`;
}

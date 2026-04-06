import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'
import './index.css'

// ── PWA Service Worker Registration ──────────────────────────────────────────
// autoUpdate: SW updates silently in background; on next visit new version loads
const updateSW = registerSW({
  onNeedRefresh() {
    // Show a subtle toast asking the user to refresh
    const banner = document.createElement('div');
    banner.id = 'pwa-update-banner';
    banner.innerHTML = `
      <div style="
        position:fixed; bottom:16px; left:50%; transform:translateX(-50%);
        background:#16a34a; color:#fff; padding:12px 20px; border-radius:12px;
        display:flex; align-items:center; gap:12px; z-index:9999;
        font-family:system-ui,sans-serif; font-size:13px; box-shadow:0 4px 24px rgba(0,0,0,0.2);
      ">
        <span>🔄 New version available</span>
        <button onclick="document.getElementById('pwa-update-banner').remove(); window.__pwaUpdate && window.__pwaUpdate(true);"
          style="background:white;color:#16a34a;border:none;padding:4px 12px;border-radius:8px;cursor:pointer;font-weight:600;font-size:12px;">
          Update
        </button>
        <button onclick="document.getElementById('pwa-update-banner').remove();"
          style="background:transparent;color:white;border:none;cursor:pointer;font-size:18px;line-height:1;">
          ×
        </button>
      </div>`;
    document.body.appendChild(banner);
    (window as any).__pwaUpdate = updateSW;
  },
  onOfflineReady() {
    console.log('CocoFresh is ready to work offline 🥥');
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)

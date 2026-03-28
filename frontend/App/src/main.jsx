import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const restoreSpaRoute = () => {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);
  const redirectPath = url.searchParams.get("__spa_redirect");

  if (!redirectPath) {
    return;
  }

  url.searchParams.delete("__spa_redirect");

  const normalizedRedirect = redirectPath.startsWith("/")
    ? redirectPath
    : `/${redirectPath}`;

  window.history.replaceState(null, "", normalizedRedirect);
};

restoreSpaRoute();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

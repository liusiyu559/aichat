import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Failed to mount application:", error);
  document.body.innerHTML = `<div style="color:red; padding:20px;">
    <h1>Application Failed to Start</h1>
    <pre>${error instanceof Error ? error.message : String(error)}</pre>
  </div>`;
}
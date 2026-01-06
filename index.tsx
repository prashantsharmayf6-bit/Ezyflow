
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("FATAL: Could not find root element to mount Ezyflow.");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("Ezyflow: Application mounted successfully.");
  } catch (error) {
    console.error("Ezyflow: Failed to render application:", error);
    rootElement.innerHTML = `
      <div style="padding: 40px; font-family: sans-serif; text-align: center; background: white; height: 100vh;">
        <h1 style="color: #4f46e5; margin-bottom: 16px;">Launch Interrupted</h1>
        <p style="color: #6b7280; margin-bottom: 24px;">An error occurred while initializing Ezyflow. Please check the browser console for specific details.</p>
        <button onclick="window.location.reload()" style="background: #4f46e5; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: bold; cursor: pointer; box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4);">Retry Launch</button>
      </div>
    `;
  }
}

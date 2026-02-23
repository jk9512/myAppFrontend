import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Analytics } from "@vercel/analytics/react"

// 🔄 Wake up Render free instance as soon as the app loads
// (Render free tier sleeps after 15 min of inactivity)
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
fetch(`${API}/health`).catch(() => { });

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>
);

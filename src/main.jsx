import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";

import "./styles/styles.css";
import "./styles/agent.css";
import "./styles/trip.css";
import "./styles/pipeline.css";

import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

registerSW({ immediate: true });

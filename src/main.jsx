import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Schedule from "./pages/schedule/index.jsx";
import Login from "./pages/auth/index.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Login />
    <Schedule />
  </StrictMode>
);

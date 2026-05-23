import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import NerveBlockReference from "./NerveBlockReference.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <NerveBlockReference />
  </StrictMode>
);

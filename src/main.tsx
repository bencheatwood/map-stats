import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import Layout from "./app/Layout/Layout";
import { ThemeProvider } from "./app/Layout/theme-provider";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
    <StrictMode>
      <Layout />
    </StrictMode>
  </ThemeProvider>,
);

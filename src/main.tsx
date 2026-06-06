import "./index.css";
import { RotateCw } from "lucide-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { toast } from "sonner";

import { Button } from "#ui/button";

import Layout from "./app/Layout/Layout";
import { ThemeProvider } from "./app/Layout/theme-provider";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
    <StrictMode>
      <Layout />
    </StrictMode>
  </ThemeProvider>,
);

function setupAutoUpdate() {
  const interval = 1000 * 5;

  const getActiveHash = () => {
    const scripts = [...document.querySelectorAll("script")] as HTMLScriptElement[];
    const mainScript = scripts.find((s) => s.src && s.src.includes("/assets/index-"));
    return mainScript ? mainScript.src : null;
  };

  const currentScriptSrc = getActiveHash();
  const checkForUpdates = async () => {
    try {
      const response = await fetch(`/index.html?t=${new Date().toISOString()}`, {
        cache: "no-store",
      });
      const html = await response.text();

      const match = /src="([^"]*\/assets\/index-.*\.js)"/.exec(html);
      const latestScriptSrc = match ? match[1] : null;

      if (latestScriptSrc && currentScriptSrc && !currentScriptSrc.endsWith(latestScriptSrc)) {
        if (!toast.getToasts().length) {
          toast.info("New version available, update now?", {
            action: (
              <Button
                className="absolute right-4 border-blue-400 bg-transparent hover:bg-transparent dark:border-blue-500/80 dark:hover:bg-transparent"
                variant="outline"
                size="icon-xs"
                onClick={() => globalThis.location.reload()}
              >
                <RotateCw />
              </Button>
            ),
            duration: Infinity,
          });
        }
      }
    } catch (e) {
      throw new Error((e as Error).message);
    }
  };

  setInterval(() => {
    Promise.resolve(checkForUpdates()).catch((e: Error) =>
      console.error("Update check failed:", e.message),
    );
  }, interval);
}

setupAutoUpdate();

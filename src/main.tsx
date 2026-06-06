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
  const interval = 1000 * 60 * 5;

  const currentScriptSrc = document
    .querySelector('script[src*="/assets/index-"]')
    ?.getAttribute("src")
    ?.split("/")
    .pop();
  const checkForUpdates = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.BASE_URL}/index.html?t=${new Date().toISOString()}`,
        {
          cache: "no-store",
        },
      );
      const html = await response.text();
      const match = html.match(/src=["'](?:[^"']*\/)?assets\/(index-[a-zA-Z0-9_-]+\.js)["']/);

      if (currentScriptSrc && match && currentScriptSrc !== match[1]) {
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

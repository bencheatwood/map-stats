import { Toaster } from "#ui/sonner";

import Bracket from "#app/Bracket/Bracket";
import { useTheme } from "./theme-provider";

export default function Layout() {
  const { theme } = useTheme();

  return (
    <main className="flex max-h-dvh w-full p-4 sm:p-8">
      <Toaster
        theme={theme}
        richColors
        position="top-center"
        invert
        offset={{ top: "8px" }}
        duration={10_000}
      />
      <Bracket />
    </main>
  );
}

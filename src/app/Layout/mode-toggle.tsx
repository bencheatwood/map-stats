import { Moon, Sun } from "lucide-react";

import { DropdownMenuItem } from "#ui/dropdown-menu";

import { useTheme } from "./theme-provider";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  function changeTheme() {
    const root = globalThis.document.documentElement;

    if (root.classList.contains("dark")) setTheme("light");
    else setTheme("dark");
  }

  return (
    <DropdownMenuItem
      onClick={changeTheme}
      className="hover:bg-muted/70 cursor-pointer"
      closeOnClick={false}
    >
      {theme !== "dark" ? <Sun /> : <Moon />}
      Toggle Theme
    </DropdownMenuItem>
  );
}

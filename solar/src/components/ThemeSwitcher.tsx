import { Monitor, Moon, Sun } from "lucide-react";
import { useLayoutEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  applyDomColorScheme,
  readStoredScheme,
  resolveDark,
  type ColorScheme,
  writeStoredScheme,
} from "@/lib/theme";

export function ThemeSwitcher() {
  const [scheme, setScheme] = useState<ColorScheme>(() => readStoredScheme());

  useLayoutEffect(() => {
    applyDomColorScheme(scheme);
  }, [scheme]);

  useLayoutEffect(() => {
    if (scheme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyDomColorScheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [scheme]);

  const dark = resolveDark(scheme);

  function select(next: ColorScheme) {
    setScheme(next);
    writeStoredScheme(next);
    applyDomColorScheme(next);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 shrink-0 border-border bg-card text-foreground shadow-sm hover:bg-muted/80 dark:hover:bg-muted"
          aria-label="Color theme"
        >
          {dark ? <Moon className="size-4" aria-hidden /> : <Sun className="size-4" aria-hidden />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={scheme}
          onValueChange={(v) => select(v as ColorScheme)}
        >
          <DropdownMenuRadioItem value="light" className="gap-2">
            <Sun className="size-4 shrink-0 opacity-70" aria-hidden />
            Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark" className="gap-2">
            <Moon className="size-4 shrink-0 opacity-70" aria-hidden />
            Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system" className="gap-2">
            <Monitor className="size-4 shrink-0 opacity-70" aria-hidden />
            System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

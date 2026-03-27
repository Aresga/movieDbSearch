import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/**
 * ModeToggle Component
 * Provides a dropdown menu to switch between Light, Dark, and System color themes.
 */
export function ModeToggle() {
    // Access the theme setter from next-themes provider
    const { setTheme } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {/* The Button uses 'relative' to stack the Sun and Moon icons on top of each other.
                  'sr-only' provides a label for screen readers without showing text in the UI.
                */}
                <Button variant="ghost" size="icon" className="relative size-8 shrink-0 text-muted-foreground hover:text-foreground">
                    {/* Sun Icon: Visible in Light mode (scale-100), shrinks and rotates away in Dark mode */}
                    <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    {/* Moon Icon: Hidden by default (scale-0), rotates into view in Dark mode */}
                    <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            {/* Align the dropdown menu to the right side of the button */}
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                    Dark
                </DropdownMenuItem>
                {/* 'System' matches the user's OS-level light/dark preference */}
                <DropdownMenuItem onClick={() => setTheme("system")}>
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

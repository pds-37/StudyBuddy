import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "../../store/theme-store";
import { useEffect } from "react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }, [theme]);

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-500 dark:text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-900 dark:text-white transition-all group relative overflow-hidden"
      aria-label="Toggle theme"
    >
      <div className="relative z-10 flex items-center justify-center">
        {theme === 'dark' ? (
          <Sun size={18} className="text-amber-400" />
        ) : (
          <Moon size={18} className="text-blue-500" />
        )}
      </div>
      <div className="absolute inset-0 bg-slate-50 dark:bg-slate-50 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}

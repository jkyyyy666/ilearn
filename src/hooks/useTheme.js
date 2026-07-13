import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { APP_CONFIG } from "../utils/constants";

/**
 * 主题管理 Hook
 * 管理深色/浅色主题切换
 */
export function useTheme() {
  const [theme, setTheme] = useLocalStorage(APP_CONFIG.themeKey, "light");

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, [setTheme]);

  const isDark = theme === "dark";

  // 同步到 HTML
  document.documentElement.setAttribute("data-theme", theme);

  return { theme, isDark, toggleTheme, setTheme };
}

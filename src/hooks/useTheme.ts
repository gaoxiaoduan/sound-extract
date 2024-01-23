import { useEffect, useState } from "react";

type themeType = "garden" | "dim";

export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    const localTheme = window.localStorage.getItem("theme");
    if (localTheme) {
      return localTheme as themeType;
    }
    return "garden";
  });

  // 监听系统主题变化
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("theme", theme);

    const handleColorSchemeChange = (e: MediaQueryListEvent) => {
      const newColorScheme = e.matches ? "dim" : "garden";
      setTheme(newColorScheme);
      window.localStorage.setItem("theme", newColorScheme);
    };

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", handleColorSchemeChange);

    return () => {
      // 清理副作用
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", handleColorSchemeChange);
    };
  }, [theme]);

  return { theme, setTheme };
};

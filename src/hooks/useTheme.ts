import { useEffect, useState } from 'react';

export function useTheme() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const check = () => {
      setIsDark(document.documentElement.classList.contains('dark') || true);
    };
    check();
  }, []);

  return { isDark, toggleTheme: () => setIsDark(!isDark) };
}

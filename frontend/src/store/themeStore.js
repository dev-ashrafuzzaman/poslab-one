import { create } from 'zustand'
export const useThemeStore = create((set) => ({
  theme: "light",
  toggle: () => set((s) => ({ theme: s.theme === "light" ? "light" : "light" })),
  setTheme: (t) => set({ theme: t }),
}));

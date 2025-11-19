export const applyAccent = (color: string) => {
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty("--accent-color", color);
  }
};

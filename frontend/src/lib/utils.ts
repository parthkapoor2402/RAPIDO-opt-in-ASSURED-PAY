/** Shared design tokens and class helpers for Assured Pay UI. */
export const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export const APP_MAX_WIDTH = "max-w-md";

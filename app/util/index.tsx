export const classNames = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(" ");

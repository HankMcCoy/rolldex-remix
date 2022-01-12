export const classNames = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(" ");

export const isMac =
  typeof navigator !== "undefined" && navigator?.platform?.startsWith("Mac");

export const CmdCtrlKey = isMac ? "Cmd" : "Ctrl";

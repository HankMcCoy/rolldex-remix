export const classNames = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(" ");

export const isMac =
  typeof navigator !== "undefined" && navigator?.platform?.startsWith("Mac");

export const CmdCtrlKey = isMac ? "Cmd" : "Ctrl";

export function asString<T>(value: T | string): string {
  if (typeof value === "string") return value;

  throw new Error(
    `Expected ${JSON.stringify(
      value
    )} to be a string, but instead was type '${typeof value}'`
  );
}

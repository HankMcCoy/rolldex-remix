import { useEffect, useRef, MutableRefObject } from "react";
import isHotkey from "is-hotkey";
import { HtmlMetaDescriptor, MetaFunction } from "remix";
import { Params } from "react-router";

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

export function useShortcut<T extends HTMLElement>(
  shortcut: string | undefined
): MutableRefObject<T | null> {
  const clickerRef = useRef<T>(null);
  useEffect(() => {
    if (!shortcut) return;

    const checkHotkey = isHotkey(shortcut);
    const listener = (e: KeyboardEvent) => {
      if (!clickerRef.current) throw new Error("Broken clicker ref");

      if (checkHotkey(e)) {
        e.preventDefault();
        clickerRef.current.click();
      }
    };
    window.addEventListener("keydown", listener);

    return () => window.removeEventListener("keydown", listener);
  }, [shortcut]);
  return clickerRef;
}

/*
export function createSimpleMeta<LoaderData>(
  foo: ({
    data,
    params,
  }: {
    data: LoaderData;
    params: Params;
  }) => HtmlMetaDescriptor
) {
  const meta: MetaFunction = (args) => {
    if (args.data)
  };
  return meta;
}
*/

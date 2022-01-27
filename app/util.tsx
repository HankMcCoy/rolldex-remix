import { useEffect, useRef, MutableRefObject, useState } from "react";
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

export function useHover(): [
  React.MutableRefObject<HTMLElement | null>,
  boolean
] {
  const [value, setValue] = useState(false);

  const ref = useRef<HTMLElement | null>(null);

  const handleMouseOver = () => setValue(true);
  const handleMouseOut = () => setValue(false);

  useEffect(() => {
    const node = ref.current;
    if (node) {
      node.addEventListener("mouseover", handleMouseOver);
      node.addEventListener("mouseout", handleMouseOut);

      return () => {
        node.removeEventListener("mouseover", handleMouseOver);
        node.removeEventListener("mouseout", handleMouseOut);
      };
    }
  }, []);

  return [ref, value];
}

export function useHoverCombo(
  delay: number = 150
): [
  React.MutableRefObject<HTMLElement | null>,
  React.MutableRefObject<HTMLElement | null>,
  boolean
] {
  const [isHovering, setIsHovering] = useState(false);
  const [refA, isHoveringA] = useHover();
  const [refB, isHoveringB] = useHover();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const latestHoveringA = useRef(isHoveringA);
  const latestHoveringB = useRef(isHoveringB);

  useEffect(() => {
    latestHoveringA.current = isHoveringA;
    latestHoveringB.current = isHoveringB;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (isHoveringA || isHoveringB) {
      timeoutRef.current = setTimeout(() => {
        if (latestHoveringA.current || latestHoveringB.current) {
          setIsHovering(true);
        }
      }, delay);
    } else {
      timeoutRef.current = setTimeout(() => {
        if (!latestHoveringA.current && !latestHoveringB.current) {
          setIsHovering(false);
        }
      }, delay);
    }
  }, [isHoveringA, isHoveringB, delay]);

  return [refA, refB, isHovering];
}

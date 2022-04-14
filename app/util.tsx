import { useEffect, useRef, MutableRefObject, useState } from "react";
import isHotkey from "is-hotkey";
import { Params } from "react-router-dom";

export { useClickHotkey } from "./util/keyboard-shortcuts";

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
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isHoveringA, isHoveringB, delay]);

  return [refA, refB, isHovering];
}

export function getParams<T extends ReadonlyArray<string>>(
  params: Params<string>,
  keys: T
): {
  [K in T extends ReadonlyArray<infer U> ? U : never]: string;
} {
  type Result = {
    [K in T extends ReadonlyArray<infer U> ? U : never]: string;
  };
  return keys.reduce((acc, key): Result => {
    if (!params[key]) throw new Error(`Expected param '${key}' to exist`);
    return {
      ...acc,
      [key]: params[key],
    };
  }, {} as Result);
}

export function getQueryParams<T extends ReadonlyArray<string>>(
  request: Request,
  keys: T
): {
  [K in T extends ReadonlyArray<infer U> ? U : never]: string;
} {
  type Result = {
    [K in T extends ReadonlyArray<infer U> ? U : never]: string;
  };
  const { searchParams } = new URL(request.url);
  return keys.reduce((acc, key): Result => {
    if (!searchParams.get(key))
      throw new Error(`Expected param '${key}' to exist`);
    return {
      ...acc,
      [key]: searchParams.get(key),
    };
  }, {} as Result);
}

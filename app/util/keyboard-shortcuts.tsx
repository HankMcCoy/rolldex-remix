import isHotkey from "is-hotkey";
import { MutableRefObject, useRef, useEffect } from "react";

const listenersByHotkey: Record<string, () => void> = {};

export function useClickHotkey<T extends HTMLElement>(
  hotkey: string | undefined
): MutableRefObject<T | null> {
  const clickerRef = useRef<T>(null);
  useHotkey(hotkey, () => {
    if (!clickerRef.current) throw new Error("BAD");
    clickerRef.current.click();
  });

  return clickerRef;
}

export function useMountHotkeyListener() {
  useEffect(() => {
    function hotkeyListener(e: KeyboardEvent) {
      const hotkeys = Object.keys(listenersByHotkey);
      for (let hotkey of hotkeys) {
        if (isHotkey(hotkey)(e)) {
          e.preventDefault();
          listenersByHotkey[hotkey]();
          break;
        }
      }
    }
    window.addEventListener("keydown", hotkeyListener);
    return () => window.removeEventListener("keydown", hotkeyListener);
  }, []);
}

export function useHotkey(hotkey: string | undefined, listener: () => void) {
  useEffect(() => {
    if (!hotkey) return;
    if (listenersByHotkey[hotkey])
      throw new Error(`Redundant listener subscribed for hotkey ${hotkey}`);

    listenersByHotkey[hotkey] = listener;

    return () => {
      delete listenersByHotkey[hotkey];
    };
  }, [hotkey, listener]);
}

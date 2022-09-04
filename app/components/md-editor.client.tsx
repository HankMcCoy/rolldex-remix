import EasyMDE from "easymde";
import { useEffect, useRef } from "react";

interface MdEditorProps {
  name: string;
  defaultValue?: string;
  minHeight?: number;
}
export const MdEditor = ({
  name,
  defaultValue,
  minHeight = 100,
}: MdEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const easyMde = useRef<EasyMDE>();

  useEffect(() => {
    easyMde.current = new EasyMDE({
      spellChecker: false,
      element: textareaRef.current ?? undefined,
      initialValue: defaultValue,
      toolbar: false,
      status: false,
      shortcuts: {
        drawLink: "Shift-Cmd-K",
      },
    });

    easyMde.current.codemirror.setOption("extraKeys", {
      Tab: false,
      "Shift-Tab": false,
    });

    return () => {
      if (easyMde.current) {
        easyMde.current.toTextArea();
        easyMde.current = undefined;
      }
    };
  }, [name, defaultValue]);

  return (
    <div
      className="md-editor-root focus:ring-1"
      style={{ minHeight: minHeight }}
    >
      <textarea name={name} ref={textareaRef} />
    </div>
  );
};

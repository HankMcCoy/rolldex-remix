import { FunctionComponent } from "react";
import { ClientOnly } from "remix-utils";
import RemarkableMarkdown from "react-remarkable";
import { MdEditor } from "./md-editor.client";

const MarkdownStyler: FunctionComponent = ({ children }) => {
  return <div className="markdown">{children}</div>;
};
export const Markdown: FunctionComponent = ({ children }) => {
  return (
    <RemarkableMarkdown container={MarkdownStyler}>
      {children}
    </RemarkableMarkdown>
  );
};

type MarkdownEditorProps = {
  name: string;
  defaultValue: string;
  autoFocus?: boolean;
  minHeight?: number;
};
export const MarkdownEditor: FunctionComponent<MarkdownEditorProps> = (
  props
) => {
  return (
    <ClientOnly fallback={<textarea {...props} className="w-full" rows={6} />}>
      {() => <MdEditor {...props} />}
    </ClientOnly>
  );
};

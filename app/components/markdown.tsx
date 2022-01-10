import { FunctionComponent } from "react";
import RemarkableMarkdown from "react-remarkable";

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

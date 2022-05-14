import React, { FunctionComponent } from "react";
import { MarkdownEditor } from "./markdown";

interface LabelRowProps {
  label: string;
  title?: string;
}
export const LabelRow: FunctionComponent<LabelRowProps> = ({
  label,
  title,
  children,
}) => (
  <div>
    <label title={title ?? label}>
      <span className="block text-lg font-serif">{label}</span>
      {children}
    </label>
  </div>
);

interface TextFieldProps {
  label: string;
  name: string;
  type?: "text" | "email";
  title?: string;
  defaultValue?: string;
  autoFocus?: boolean;
}
export const TextField: FunctionComponent<TextFieldProps> = ({
  label,
  title,
  name,
  defaultValue,
  autoFocus,
  type = "text",
}) => {
  return (
    <LabelRow label={label} title={title}>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        className="w-full"
      />
    </LabelRow>
  );
};

interface TextareaFieldProps {
  label: string;
  name: string;
  title?: string;
  defaultValue?: string;
  rows?: number;
  autoFocus?: boolean;
}
export const TextareaField: FunctionComponent<TextareaFieldProps> = ({
  label,
  name,
  title,
  rows,
  defaultValue,
  autoFocus,
}) => {
  return (
    <LabelRow label={label} title={title}>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        className="w-full"
        autoFocus
      />
    </LabelRow>
  );
};

interface MarkdownFieldProps {
  label: string;
  name: string;
  title?: string;
  defaultValue?: string;
  autoFocus?: boolean;
}
export const MarkdownField: FunctionComponent<MarkdownFieldProps> = ({
  label,
  name,
  title,
  defaultValue,
  autoFocus,
}) => {
  return (
    <LabelRow label={label} title={title}>
      <MarkdownEditor name={name} defaultValue={defaultValue ?? ""} autoFocus />
    </LabelRow>
  );
};

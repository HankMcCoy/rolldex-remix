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
}
export const TextField: FunctionComponent<TextFieldProps> = ({
  label,
  title,
  name,
  defaultValue,
  type = "text",
}) => {
  return (
    <LabelRow label={label} title={title}>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
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
}
export const TextareaField: FunctionComponent<TextareaFieldProps> = ({
  label,
  name,
  title,
  rows,
  defaultValue,
}) => {
  return (
    <LabelRow label={label} title={title}>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        className="w-full"
      />
    </LabelRow>
  );
};

interface MarkdownFieldProps {
  label: string;
  name: string;
  title?: string;
  defaultValue?: string;
}
export const MarkdownField: FunctionComponent<MarkdownFieldProps> = ({
  label,
  name,
  title,
  defaultValue,
}) => {
  return (
    <LabelRow label={label} title={title}>
      <MarkdownEditor name={name} defaultValue={defaultValue ?? ""} />
    </LabelRow>
  );
};

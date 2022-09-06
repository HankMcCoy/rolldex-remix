import { FunctionComponent } from "react";
import { MarkdownEditor } from "./markdown";

interface LabelRowProps {
  label: string;
  title?: string;
  errors?: string[];
}
export const LabelRow: FunctionComponent<LabelRowProps> = ({
  label,
  title,
  errors,
  children,
}) => (
  <label title={title ?? label} className="block mb-3 last:mb-0">
    <span className="block text-lg font-serif mb-1">{label}</span>
    {children}
    {errors ? (
      <span className="block text-red-800">{errors.join(" ")}</span>
    ) : null}
  </label>
);

interface TextFieldProps {
  label: string;
  name: string;
  errors?: string[];
  type?: "text" | "email";
  title?: string;
  defaultValue?: string;
}
export const TextField: FunctionComponent<TextFieldProps> = ({
  label,
  title,
  name,
  errors,
  defaultValue,
  type = "text",
}) => {
  return (
    <LabelRow label={label} title={title} errors={errors}>
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
  errors?: string[];
  title?: string;
  defaultValue?: string;
  rows?: number;
}
export const TextareaField: FunctionComponent<TextareaFieldProps> = ({
  label,
  name,
  errors,
  title,
  rows,
  defaultValue,
}) => {
  return (
    <LabelRow label={label} title={title} errors={errors}>
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
  errors?: string[];
  title?: string;
  defaultValue?: string;
}
export const MarkdownField: FunctionComponent<MarkdownFieldProps> = ({
  label,
  name,
  errors,
  title,
  defaultValue,
}) => {
  return (
    <LabelRow label={label} title={title} errors={errors}>
      <MarkdownEditor name={name} defaultValue={defaultValue ?? ""} />
    </LabelRow>
  );
};

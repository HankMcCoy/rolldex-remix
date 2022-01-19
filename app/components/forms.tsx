import React, { FunctionComponent } from "react";

interface LabelRowProps {
  label: string;
  title?: string;
}
export const LabelRow: FunctionComponent<LabelRowProps> = ({
  label,
  title,
  children,
}) => (
  <p>
    <label title={title ?? label}>
      <span className="block text-lg font-serif">{label}</span>
      {children}
    </label>
  </p>
);

interface TextFieldProps {
  label: string;
  title?: string;
  defaultValue?: string;
}
export const TextField: FunctionComponent<TextFieldProps> = ({
  label,
  title,
  defaultValue,
}) => {
  return (
    <LabelRow label={label} title={title}>
      <input
        type="text"
        name="name"
        defaultValue={defaultValue}
        className="w-full"
      />
    </LabelRow>
  );
};

interface TextareaFieldProps {
  label: string;
  title?: string;
  defaultValue?: string;
  rows?: number;
}
export const TextareaField: FunctionComponent<TextareaFieldProps> = ({
  label,
  title,
  rows,
  defaultValue,
}) => {
  return (
    <LabelRow label={label} title={title}>
      <textarea
        name="name"
        defaultValue={defaultValue}
        rows={rows}
        className="w-full"
      />
    </LabelRow>
  );
};

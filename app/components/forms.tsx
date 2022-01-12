import React, { FunctionComponent } from "react";

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
    <p>
      <label title={title ?? label}>
        <span className="block text-lg font-serif">{label}</span>
        <input
          type="text"
          name="name"
          defaultValue={defaultValue}
          className="w-full"
        />
      </label>
    </p>
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
    <p>
      <label title={title ?? label}>
        <span className="block text-lg font-serif">{label}</span>
        <textarea
          name="name"
          defaultValue={defaultValue}
          rows={rows}
          className="w-full"
        />
      </label>
    </p>
  );
};

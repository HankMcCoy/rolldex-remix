import { FunctionComponent, useState } from "react";
import * as Switch from "@radix-ui/react-switch";
import { MarkdownEditor } from "./markdown";
import { classNames } from "~/util";

interface StandardFieldProps {
  label: string;
  title?: string;
  errors?: string[];
  name: string;
  defaultValue?: string;
}

interface LabelRowProps {
  label: string;
  title?: string;
  errors?: string[];
  align?: "left" | "top";
}
export const LabelRow: FunctionComponent<LabelRowProps> = ({
  label,
  title,
  errors,
  children,
  align = "top",
}) => (
  <label title={title ?? label} className="block mb-3 last:mb-0">
    <div
      className={`flex ${
        align === "left" ? "flex-row items-center justify-between" : "flex-col"
      }`}
    >
      <div className="text-lg font-serif mb-1">{label}</div>
      {children}
    </div>
    {errors ? (
      <span className="block text-red-800">{errors.join(" ")}</span>
    ) : null}
  </label>
);

interface TextFieldProps extends StandardFieldProps {
  type?: "text" | "email";
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

interface TextareaFieldProps extends StandardFieldProps {
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

interface MarkdownFieldProps extends StandardFieldProps {}
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

type SwitchFieldProps = Omit<StandardFieldProps, "defaultValue"> & {
  defaultValue?: boolean;
};
export const SwitchField: FunctionComponent<SwitchFieldProps> = ({
  label,
  name,
  errors,
  title,
  defaultValue,
}) => {
  const [enabled, setEnabled] = useState(defaultValue);
  return (
    <LabelRow label={label} title={title} errors={errors} align="left">
      <Switch.Root
        name={name}
        defaultChecked={defaultValue}
        onCheckedChange={setEnabled}
        className={classNames(
          enabled ? "bg-indigo-600" : "bg-gray-200",
          "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        )}
      >
        <Switch.Thumb
          className={classNames(
            enabled ? "translate-x-5" : "translate-x-0",
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
          )}
        />
      </Switch.Root>
    </LabelRow>
  );
};

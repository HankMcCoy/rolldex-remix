import { FunctionComponent } from "react";
import { Link } from "remix";
import { classNames, useShortcut } from "~/util";

type ButtonType = "primary" | "secondary";
const basicStyles =
  "flex items-center h-10 px-4 white rounded hover:bg-white hover:bg-opacity-20";
const primaryStyles = "border border-white ";
const getStyles = (type: ButtonType | undefined) =>
  classNames(basicStyles, type === "primary" ? primaryStyles : "");

export interface LinkButtonProps {
  to: string;
  title: string;
  shortcut?: string;
  type?: ButtonType;
}
export const LinkButton: FunctionComponent<LinkButtonProps> = ({
  to,
  title,
  type,
  shortcut,
  children,
}) => {
  const shortcutRef = useShortcut<HTMLAnchorElement>(shortcut);
  return (
    <Link to={to} title={title} className={getStyles(type)} ref={shortcutRef}>
      {children}
    </Link>
  );
};
export interface ButtonProps {
  title: string;
  form?: string;
  shortcut?: string;
  type?: ButtonType;
}
export const Button: FunctionComponent<ButtonProps> = ({
  title,
  type,
  form,
  shortcut,
  children,
}) => {
  const shortcutRef = useShortcut<HTMLButtonElement>(shortcut);
  return (
    <button
      form={form}
      title={title}
      className={getStyles(type)}
      ref={shortcutRef}
    >
      {children}
    </button>
  );
};

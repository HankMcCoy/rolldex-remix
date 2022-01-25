import { FunctionComponent, MouseEventHandler } from "react";
import { Link } from "remix";
import { classNames, useShortcut } from "~/util";

type ButtonStyle =
  | "darkPrimary"
  | "darkSecondary"
  | "lightPrimary"
  | "lightSecondary";
type ButtonSize = "small" | "medium";
const basicStyles = "flex items-center rounded ";
const styles: Record<ButtonStyle | ButtonSize, string> = {
  darkPrimary: "hover:bg-white hover:bg-opacity-20 border border-white",
  darkSecondary: "hover:bg-white hover:bg-opacity-20",
  lightPrimary: "",
  lightSecondary: "border border-violet-800 text-violet-800 hover:bg-violet-50",

  small: "h-7 px-2",
  medium: "h-10 px-4 ",
};

const getStyles = (style: ButtonStyle, size: ButtonSize) =>
  classNames(basicStyles, styles[style], styles[size]);

export interface LinkButtonProps {
  to: string;
  title: string;
  style: ButtonStyle;
  size?: ButtonSize;
  shortcut?: string;
}
export const LinkButton: FunctionComponent<LinkButtonProps> = ({
  to,
  title,
  style,
  shortcut,
  children,
  size = "medium",
}) => {
  const shortcutRef = useShortcut<HTMLAnchorElement>(shortcut);
  return (
    <Link
      to={to}
      title={title}
      className={getStyles(style, size)}
      ref={shortcutRef}
    >
      {children}
    </Link>
  );
};
export interface ButtonProps {
  title: string;
  style: ButtonStyle;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  size?: ButtonSize;
  form?: string;
  shortcut?: string;
}
export const Button: FunctionComponent<ButtonProps> = ({
  title,
  style,
  onClick,
  form,
  shortcut,
  size = "medium",
  children,
}) => {
  const shortcutRef = useShortcut<HTMLButtonElement>(shortcut);
  return (
    <button
      form={form}
      title={title}
      onClick={onClick}
      className={getStyles(style, size)}
      ref={shortcutRef}
    >
      {children}
    </button>
  );
};

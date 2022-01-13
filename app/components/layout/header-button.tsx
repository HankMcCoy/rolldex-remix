import { FunctionComponent } from "react";
import { Link } from "remix";
import { classNames } from "~/util";

type ButtonType = "primary" | "secondary";
const basicStyles =
  "flex items-center h-10 px-4 white rounded hover:bg-white hover:bg-opacity-20";
const primaryStyles = "border border-white ";
const getStyles = (type: ButtonType | undefined) =>
  classNames(basicStyles, type === "primary" ? primaryStyles : "");

interface HeaderLinkButtonProps {
  to: string;
  title: string;
  type?: ButtonType;
}
export const HeaderLinkButton: FunctionComponent<HeaderLinkButtonProps> = ({
  to,
  title,
  children,
  type,
}) => {
  return (
    <Link to={to} title={title} className={getStyles(type)}>
      {children}
    </Link>
  );
};
interface HeaderButtonProps {
  title: string;
  type?: ButtonType;
}
export const HeaderButton: FunctionComponent<HeaderButtonProps> = ({
  title,
  children,
  type,
}) => {
  return (
    <button title={title} className={getStyles(type)}>
      {children}
    </button>
  );
};

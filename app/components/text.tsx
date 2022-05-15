import { FunctionComponent, ReactNode, ReactElement } from "react";
import { classNames } from "~/util";

interface Props {
  l: 1 | 2 | 3 | 4;
  className?: string;
}
const levelToClassName = {
  1: "text-4xl font-serif",
  2: "text-2xl font-serif",
  3: "text-xl font-serif",
  4: "text-l font-serif",
};
export const Heading: FunctionComponent<Props> = ({
  l,
  className,
  children,
}) => {
  return (
    <div
      role="heading"
      aria-level={l}
      className={classNames(levelToClassName[l], className)}
    >
      {children}
    </div>
  );
};

export const ErrorText = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => <span className="text-red-800">{children}</span>;

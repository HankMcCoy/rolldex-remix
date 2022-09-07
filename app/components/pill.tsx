import { FunctionComponent } from "react";

interface Props {
  variant: "dark-bg" | "light-bg";
}
export const Pill: FunctionComponent<Props> = ({ variant, children }) => {
  return (
    <span className="inline-block px-2 py-1 text-white border border-white rounded-md">
      {children}
    </span>
  );
};

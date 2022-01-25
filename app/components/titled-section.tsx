import { FunctionComponent, ReactNode } from "react";
import { Heading } from "~/components/text";
interface Props {
  title: string;
  controls?: ReactNode;
}
export const TitledSection: FunctionComponent<Props> = ({
  title,
  controls,
  children,
}) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <Heading l={2}>{title}</Heading>
      {controls}
    </div>
    {children}
  </div>
);

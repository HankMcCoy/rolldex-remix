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

export const PrivateTitledSection: FunctionComponent<Props> = ({
  title,
  children,
}) => (
  <details className="cursor-pointer pl-6 py-3 -ml-6 bg-gray-50 space-y-2 border border-gray-200">
    <summary>
      <Heading l={2} className="inline">
        {title}
      </Heading>
    </summary>
    {children}
  </details>
);

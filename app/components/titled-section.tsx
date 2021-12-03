import { FunctionComponent } from "react";
import { Heading } from "~/components/text";
interface Props {
  title: string;
}
export const TitledSection: FunctionComponent<Props> = ({
  title,
  children,
}) => (
  <div>
    <Heading l={2} className="mb-2">
      {title}
    </Heading>
    {children}
  </div>
);

import { FunctionComponent } from "react";
import { Form, useTransition } from "remix";
import { CmdCtrlKey } from "~/util";
import { Main, PageHeader } from "./basics";
import { Button, LinkButton } from "./buttons";

interface FormPageProps {
  heading: string;
  breadcrumbs?: Array<{ text: string; href: string }>;
  formId: string;
  backHref: string;
}
export const FormPage: FunctionComponent<FormPageProps> = ({
  heading,
  breadcrumbs,
  formId,
  backHref,
  children,
}) => {
  const transition = useTransition();
  return (
    <>
      <PageHeader
        {...{ heading, breadcrumbs }}
        controls={
          <>
            <LinkButton
              to={backHref}
              title={`Cancel (${CmdCtrlKey}-E)`}
              shortcut="mod+e"
            >
              Cancel
            </LinkButton>
            <Button
              form={formId}
              title={`Save (${CmdCtrlKey}-S)`}
              shortcut="mod+s"
            >
              Save
            </Button>
          </>
        }
      />
      <Main>
        <div className="flex space-x-6">
          <div className="flex-1 flex flex-col space-y-6">
            <Form id={formId} method="post" className="max-w-md space-y-2">
              <fieldset disabled={transition.state === "submitting"}>
                {children}
              </fieldset>
            </Form>
          </div>
        </div>
      </Main>
    </>
  );
};

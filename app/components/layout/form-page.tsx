import { FunctionComponent, useEffect } from "react";
import { Form, useNavigate, useTransition } from "remix";
import { CmdCtrlKey } from "~/util";
import { Main, PageHeader } from "./basics";
import { Button, LinkButton } from "./buttons";

interface FormPageProps {
  heading: string;
  breadcrumbs?: Array<{ text: string; href: string }>;
  formId: string;
}
export const FormPage: FunctionComponent<FormPageProps> = ({
  heading,
  breadcrumbs,
  formId,
  children,
}) => {
  const transition = useTransition();
  const navigate = useNavigate();

  useEffect(() => {
    function confirmUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      return (e.returnValue = "THIS_VALUE_DOESNT_MATTER");
    }
    window.addEventListener("beforeunload", confirmUnload);
    return () => window.removeEventListener("beforeunload", confirmUnload);
  }, []);

  return (
    <>
      <PageHeader
        {...{ heading, breadcrumbs }}
        controls={
          <>
            <Button
              title={`Cancel (${CmdCtrlKey}-E)`}
              shortcut="mod+e"
              onClick={() => navigate(-1)}
              style="darkSecondary"
            >
              Cancel
            </Button>
            <Button
              form={formId}
              title={`Save (${CmdCtrlKey}-S)`}
              shortcut="mod+s"
              style="darkPrimary"
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

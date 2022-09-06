import { FunctionComponent, useEffect, useRef } from "react";
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
  const formRef = useRef<HTMLFormElement>(null);

  // Require confirmation before navigating away.
  useEffect(() => {
    function confirmUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      return (e.returnValue = "THIS_VALUE_DOESNT_MATTER");
    }
    window.addEventListener("beforeunload", confirmUnload);
    return () => window.removeEventListener("beforeunload", confirmUnload);
  }, []);

  // Focus the first non-hidden form element, if no other form elements are
  // already focused.
  useEffect(() => {
    if (formRef.current) {
      const firstInput = formRef.current.querySelector<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >("input:not([type=hidden]),textarea,select");
      if (
        firstInput &&
        !["INPUT", "SELECT", "TEXTAREA"].includes(
          document.activeElement?.tagName ?? ""
        )
      ) {
        firstInput.focus();
      }
    }
  }, []);

  return (
    <>
      <PageHeader
        {...{ heading, breadcrumbs }}
        controls={
          <>
            {/* The use of a LinkButton here is silly overkill, ensuring the cancel button at least kind of works even if JS is disabled */}
            <LinkButton
              title={`Cancel (${CmdCtrlKey}-E)`}
              shortcut="mod+e"
              to={breadcrumbs ? breadcrumbs[breadcrumbs.length - 1].href : "/"}
              onClick={(e) => {
                e.preventDefault();
                navigate(-1);
              }}
              style="darkSecondary"
            >
              Cancel
            </LinkButton>
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
            <Form
              id={formId}
              method="post"
              className="max-w-md space-y-2"
              ref={formRef}
            >
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

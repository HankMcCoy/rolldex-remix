import { LabelRow } from "~/components/forms";
import {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
  useActionData,
} from "remix";
import { db } from "~/db.server";
import { createUserSession } from "~/session.server";
import { getFormFields } from "~/util.server";
import { hashPassword } from "~/queries/authentication.server";
import { ErrorText, Heading } from "~/components/text";
import { Button } from "~/components/layout";
import { badRequest, forbidden } from "~/util/http-errors.server";

export default function Register() {
  const actionData = useActionData<ActionData>();
  return (
    <div className="max-w-sm mx-auto mt-8">
      <Heading l={1} className="mb-4">
        Rolldex
      </Heading>
      <form method="post">
        <fieldset>
          <LabelRow label="Email" error={actionData?.fieldErrors?.email}>
            <input
              name="email"
              type="email"
              className="w-full"
              required
              defaultValue={actionData?.fields?.email}
            />
          </LabelRow>
          <LabelRow label="Password" error={actionData?.fieldErrors?.password}>
            <input
              name="password"
              type="password"
              className="w-full"
              required
              defaultValue={actionData?.fields?.password}
            />
          </LabelRow>
          {actionData?.formError ? (
            <div className="my-2">
              <ErrorText>{actionData.formError}</ErrorText>
            </div>
          ) : null}
          <div className="flex justify-between items-center">
            <Button title="Register" style="lightPrimary">
              Register
            </Button>
            <a href="/login" className="underline">
              Log in
            </a>
          </div>
        </fieldset>
      </form>
    </div>
  );
}

const validateEmail = (email: string) => {
  if (email.indexOf("@") === -1 || email.indexOf(".") === -1)
    return "Invalid email";
  return undefined;
};

const validatePassword = (password: string) => {
  if (password.length < 5)
    return "Your password must be at least 5 characters long";

  return undefined;
};

export const meta: MetaFunction = () => ({ title: "Login" });

export const loader: LoaderFunction = async ({ request }) => {};

interface ActionData {
  formError?: string;
  fieldErrors?: { email?: string; password?: string };
  fields?: { email: string; password: string };
}
export const action: ActionFunction = async ({ request }) => {
  const { fields } = await getFormFields({ request });
  const { email, password: plaintextPassword } = fields;

  // Validate the email and password
  const fieldErrors = {
    email: validateEmail(email),
    password: validatePassword(plaintextPassword),
  };
  if (Object.values(fieldErrors).some((x) => x !== undefined)) {
    return badRequest({ fields, fieldErrors });
  }

  // Ensure the email is allowed to register
  const allowedEmails = (process.env.ALLOWED_EMAILS || "").split(",");
  if (!allowedEmails.includes(email)) {
    return forbidden({
      fields,
      fieldErrors: { email: "Email not allowed to register " },
    });
  }

  // Don't allow registrations for existing users
  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return badRequest({
      fields,
      formError: "User already exists, please log in",
    });
  }

  const passwordHash = await hashPassword(plaintextPassword);
  const user = await db.user.create({ data: { email, passwordHash } });

  return createUserSession(user.id, "/campaigns");
};

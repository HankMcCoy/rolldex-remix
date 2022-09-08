import { LabelRow } from "~/components/forms";
import { ActionFunction, MetaFunction, useActionData } from "remix";
import { z } from "zod";
import { createUserSession } from "~/session.server";
import { getFormFields } from "~/util.server";
import { ErrorText, Heading } from "~/components/text";
import { Button } from "~/components/layout";
import { badRequest } from "~/util/http-errors.server";
import {
  createUser,
  EmailNotAllowed,
  DuplicateEmailError,
  MIN_PASSWORD_LENGTH,
} from "~/queries/users.server";
import { User } from "@prisma/client";

export const meta: MetaFunction = () => ({ title: "Login" });

export default function Register() {
  const errors = useActionData<ActionData>();
  return (
    <div className="max-w-sm mx-auto mt-8">
      <Heading l={1} className="mb-4">
        Rolldex
      </Heading>
      <form method="post">
        <fieldset>
          <LabelRow label="Email" errors={errors?.fieldErrors?.email}>
            <input name="email" type="email" className="w-full" required />
          </LabelRow>
          <LabelRow
            label="Password"
            errors={errors?.fieldErrors?.plaintextPassword}
          >
            <input
              name="plaintextPassword"
              type="password"
              className="w-full"
              required
            />
          </LabelRow>
          {errors?.formErrors ? (
            <div className="my-2">
              <ErrorText>{errors.formErrors.join(", ")}</ErrorText>
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

const validation = z.object({
  email: z.string().email(),
  plaintextPassword: z.string().min(MIN_PASSWORD_LENGTH),
});
type Fields = z.infer<typeof validation>;
type ActionData = z.typeToFlattenedError<Fields> | undefined;

export const action: ActionFunction = async ({ request }) => {
  const fields = await getFormFields({ request });

  // Validate the email and password
  const parseResult = await validation.safeParseAsync(fields);
  if (!parseResult.success) {
    return badRequest<ActionData>(parseResult.error.flatten());
  }

  const { email, plaintextPassword } = parseResult.data;
  let user: User;
  try {
    user = await createUser({ email, plaintextPassword });
  } catch (e) {
    if (e instanceof EmailNotAllowed) {
      return badRequest<ActionData>({
        fieldErrors: {
          email: ["Email not allowed"],
        },
        formErrors: [],
      });
    }
    if (e instanceof DuplicateEmailError) {
      return badRequest<ActionData>({
        fieldErrors: {
          email: ["Invalid email"],
        },
        formErrors: [],
      });
    }
    throw e;
  }

  return createUserSession(user.id, "/campaigns");
};

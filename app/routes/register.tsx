import { LabelRow } from "~/components/forms";
import { ActionFunction, MetaFunction, useActionData } from "remix";
import { z } from "zod";
import { db } from "~/db.server";
import { createUserSession } from "~/session.server";
import { getFormFields } from "~/util.server";
import { hashPassword } from "~/queries/authentication.server";
import { ErrorText, Heading } from "~/components/text";
import { Button } from "~/components/layout";
import { badRequest } from "~/util/http-errors.server";

export const meta: MetaFunction = () => ({ title: "Login" });

export default function Register() {
  const { fields, errors } = useActionData<ActionData>() ?? {};
  return (
    <div className="max-w-sm mx-auto mt-8">
      <Heading l={1} className="mb-4">
        Rolldex
      </Heading>
      <form method="post">
        <fieldset>
          <LabelRow label="Email" errors={errors?.fieldErrors?.email}>
            <input
              name="email"
              type="email"
              className="w-full"
              required
              defaultValue={fields?.email}
            />
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
              defaultValue={fields?.plaintextPassword}
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

const fieldTypeSchema = {
  email: z.string(),
  plaintextPassword: z.string(),
};
const fieldTypeValidation = z.object(fieldTypeSchema);
const validation = z.object({
  email: fieldTypeSchema.email
    .email()
    .refine(
      (email) => {
        const allowedEmails = (process.env.ALLOWED_EMAILS || "").split(",");
        return allowedEmails.includes(email);
      },
      {
        message: "Email not allowed to register",
      }
    )
    .refine(
      async (email) => {
        const existingUser = await db.user.findUnique({ where: { email } });
        return !existingUser;
      },
      { message: "User already exists, please log in" }
    ),
  plaintextPassword: fieldTypeSchema.plaintextPassword.min(8),
});
type Fields = z.infer<typeof fieldTypeValidation>;
interface ActionData {
  errors: z.typeToFlattenedError<Fields>;
  fields: Fields;
}

export const action: ActionFunction = async ({ request }) => {
  const fields = fieldTypeValidation.parse(await getFormFields({ request }));

  // Validate the email and password
  const parseResult = await validation.safeParseAsync(fields);
  if (!parseResult.success) {
    return badRequest({ fields, errors: parseResult.error.flatten() });
  }

  const { email, plaintextPassword } = parseResult.data;

  const passwordHash = await hashPassword(plaintextPassword);
  const user = await db.user.create({ data: { email, passwordHash } });

  return createUserSession(user.id, "/campaigns");
};

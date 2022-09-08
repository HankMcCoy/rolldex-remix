import { ActionFunction, MetaFunction, useActionData } from "remix";
import { z } from "zod";
import { LabelRow } from "~/components/forms";
import { createUserSession } from "~/session.server";
import { getFormFields } from "~/util.server";
import { ErrorText, Heading } from "~/components/text";
import { Button } from "~/components/layout";
import { badRequest } from "~/util/http-errors.server";
import { getUserByLogin } from "~/queries/users.server";

export default function Login() {
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
            <Button title="Log in" style="lightPrimary">
              Log in
            </Button>
            <a href="/register" className="underline">
              Register
            </a>
          </div>
        </fieldset>
      </form>
    </div>
  );
}

export const meta: MetaFunction = () => ({ title: "Login" });

const fieldTypeSchema = {
  email: z.string(),
  plaintextPassword: z.string(),
};
const fieldTypeValidation = z.object(fieldTypeSchema);
const validation = z.object({
  email: fieldTypeSchema.email.email(),
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

  const user = await getUserByLogin({ email, plaintextPassword });
  if (!user) {
    return badRequest({ fields, errors: { formErrors: ["Invalid login"] } });
  }

  return createUserSession(user.id, "/campaigns");
};

import { LabelRow } from "~/components/forms";
import { ActionFunction } from "remix";
import { db } from "~/db.server";
import { createUserSession } from "~/session.server";

export default function Login() {
  return (
    <div>
      <form method="post">
        <fieldset>
          <LabelRow label="Email">
            <input name="email" type="email" />
          </LabelRow>
          <LabelRow label="Password">
            <input name="password" type="password" />
          </LabelRow>
          <button>Submit</button>
        </fieldset>
      </form>
    </div>
  );
}

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();
  const email = body.get("email");
  if (typeof email !== "string") throw new Error("Must include email");

  let user = await db.user.findUnique({ where: { email } });
  if (!user) {
    user = await db.user.create({ data: { email } });
  }
  return createUserSession(user.id, "/campaigns");
};

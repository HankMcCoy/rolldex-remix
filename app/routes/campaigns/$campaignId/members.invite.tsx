import { z } from "zod";
import { ActionFunction, redirect, MetaFunction, useActionData } from "remix";
import { FormPage } from "~/components/layout";
import { TextField } from "~/components/forms";
import { getFormFields } from "~/util.server";
import { getParams } from "~/util";
import { createMember } from "~/queries/members.server";
import { requireUserId } from "~/session.server";
import { badRequest } from "~/util/http-errors.server";

export const meta: MetaFunction = () => ({ title: "Add member" });

export default function AddMember() {
  const errors = useActionData<ActionData>();

  return (
    <FormPage heading="New Member" formId="new-member-form">
      <TextField
        label="Email:"
        name="email"
        type="email"
        errors={errors?.fieldErrors.email}
      />
    </FormPage>
  );
}

const validation = z.object({
  email: z.string().email(),
});
type Fields = z.infer<typeof validation>;
type ActionData = z.typeToFlattenedError<Fields> | undefined;

export const action: ActionFunction = async ({ params, request }) => {
  const { campaignId } = getParams(params, ["campaignId"]);
  const userId = await requireUserId(request);
  const fields = await getFormFields({
    request,
  });

  const parseResult = validation.safeParse(fields);
  if (!parseResult.success) {
    return badRequest(parseResult.error.flatten());
  }

  await createMember({ campaignId, userId, email: parseResult.data.email });
  return redirect(`/campaigns/${campaignId}`);
};

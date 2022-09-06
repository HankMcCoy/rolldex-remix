import { FormPage } from "~/components/layout";
import { ActionFunction, redirect, MetaFunction } from "remix";
import { TextField } from "~/components/forms";
import { getFormFields } from "~/util.server";
import { getParams } from "~/util";
import { createMember } from "~/queries/members.server";
import { requireUserId } from "~/session.server";

export default function AddCampaign() {
  return (
    <FormPage heading="New Member" formId="new-member-form">
      <TextField label="Email:" name="email" type="email" />
    </FormPage>
  );
}

export const meta: MetaFunction = () => ({ title: "Add campaign" });

export const action: ActionFunction = async ({ params, request }) => {
  const { campaignId } = getParams(params, ["campaignId"]);
  const userId = await requireUserId(request);
  const { email } = await getFormFields({
    request,
  });

  await createMember({ campaignId, userId, email });
  return redirect(`/campaigns/${campaignId}`);
};

import { FormPage } from "~/components/layout";
import { ActionFunction, redirect, MetaFunction } from "remix";
import { TextField } from "~/components/forms";
import { getFormFields } from "~/util.server";
import { db } from "~/db.server";

export default function AddCampaign() {
  return (
    <FormPage heading="New Member" formId="new-member-form">
      <TextField label="Email:" name="email" type="email" />
    </FormPage>
  );
}

export const meta: MetaFunction = () => ({ title: "Add campaign" });

export const action: ActionFunction = async ({ params, request }) => {
  const { campaignId } = params;
  const {
    fields: { email },
  } = await getFormFields({
    request,
  });

  if (!campaignId || !email) {
    throw new Error("BAD");
  }
  const newMember = await db.member.create({
    data: { campaignId, email, memberType: "READ_ONLY" },
  });
  return redirect(`/campaigns/${campaignId}`);
};

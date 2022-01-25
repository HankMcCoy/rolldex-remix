import { FormPage } from "~/components/layout";
import { ActionFunction, useTransition, redirect, Form } from "remix";
import { TextField, TextareaField } from "~/components/forms";
import { getFormFields } from "~/util.server";
import { db } from "~/db.server";

export default function AddCampaign() {
  const transition = useTransition();

  return (
    <FormPage heading="New Campaign" formId="new-campaign-form">
      <TextField label="Name:" name="name" />
      <TextareaField label="Summary:" name="summary" rows={3} />
    </FormPage>
  );
}

export const action: ActionFunction = async ({ request }) => {
  const {
    userId,
    fields: { name, summary },
  } = await getFormFields({
    request,
  });
  const newCampaign = await db.campaign.create({
    data: { name, summary, createdById: userId },
  });
  return redirect(`/campaigns/${newCampaign.id}`);
};

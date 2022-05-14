import { FormPage } from "~/components/layout";
import { ActionFunction, redirect, MetaFunction } from "remix";
import { TextField, TextareaField } from "~/components/forms";
import { getFormFields } from "~/util.server";
import { createCampaign } from "~/queries/campaigns.server";

export default function AddCampaign() {
  return (
    <FormPage heading="New Campaign" formId="new-campaign-form">
      <TextField label="Name:" name="name" autoFocus />
      <TextareaField label="Summary:" name="summary" rows={3} />
    </FormPage>
  );
}

export const meta: MetaFunction = () => ({ title: "Add campaign" });

export const action: ActionFunction = async ({ request }) => {
  const {
    userId,
    fields: { name, summary },
  } = await getFormFields({
    request,
  });
  const newCampaign = await createCampaign({ userId, data: { name, summary } });
  return redirect(`/campaigns/${newCampaign.id}`);
};

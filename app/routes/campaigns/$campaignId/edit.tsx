import { FormPage } from "~/components/layout";
import { ActionFunction, redirect, LoaderFunction, useLoaderData } from "remix";
import { TextField, TextareaField } from "~/components/forms";
import { getFormFields } from "~/util.server";
import { db } from "~/db.server";
import { Campaign } from "@prisma/client";

interface LoaderData {
  campaign: Campaign;
}
export let loader: LoaderFunction = async ({ request, params }) => {
  const { campaignId } = params;
  const campaign = await db.campaign.findUnique({ where: { id: campaignId } });
  return { campaign };
};

export default function EditCampaign() {
  const { campaign } = useLoaderData<LoaderData>();

  return (
    <FormPage
      heading={`Edit ${campaign.name}`}
      backHref={`/campaigns/${campaign.id}`}
      formId="edit-campaign-form"
    >
      <input type="hidden" name="id" value={campaign.id} />
      <TextField label="Name:" name="name" defaultValue={campaign.name} />
      <TextareaField
        label="Summary:"
        name="summary"
        rows={3}
        defaultValue={campaign.summary}
      />
    </FormPage>
  );
}

export const action: ActionFunction = async ({ request }) => {
  const {
    fields: { id, name, summary },
  } = await getFormFields({ request, fieldNames: ["id", "name", "summary"] });

  await db.campaign.update({
    where: { id },
    data: { name, summary },
  });
  return redirect(`/campaigns/${id}`);
};

import { FormPage } from "~/components/layout";
import {
  ActionFunction,
  redirect,
  LoaderFunction,
  useLoaderData,
  MetaFunction,
} from "remix";
import { TextField, TextareaField } from "~/components/forms";
import { getFormFields } from "~/util.server";
import { Campaign } from "@prisma/client";
import {
  enforceWriteAccess,
  getCampaign,
  updateCampaign,
} from "~/queries/campaigns.server";
import { requireUserId } from "~/session.server";
import { getParams } from "~/util";

export default function EditCampaign() {
  const { campaign } = useLoaderData<LoaderData>();

  return (
    <FormPage heading={`Edit ${campaign.name}`} formId="edit-campaign-form">
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

export const meta: MetaFunction = ({
  data,
}: {
  data: LoaderData | undefined;
}) => ({
  title: data ? `Edit ${data.campaign.name}` : "",
});

interface LoaderData {
  campaign: Campaign;
}
export let loader: LoaderFunction = async ({ request, params }) => {
  const { campaignId } = getParams(params, ["campaignId"] as const);
  const userId = await requireUserId(request);

  const [campaign] = await Promise.all([
    getCampaign({ campaignId, userId }),
    enforceWriteAccess({ campaignId, userId }),
  ]);

  return { campaign };
};

export const action: ActionFunction = async ({ request }) => {
  const { id, name, summary } = await getFormFields({ request });
  const userId = await requireUserId(request);

  await updateCampaign({
    campaignId: id,
    userId,
    data: { name, summary },
  });
  return redirect(`/campaigns/${id}`);
};

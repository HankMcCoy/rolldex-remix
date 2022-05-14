import { FormPage } from "~/components/layout";
import {
  LoaderFunction,
  ActionFunction,
  useLoaderData,
  redirect,
  MetaFunction,
} from "remix";
import { TextField, TextareaField } from "~/components/forms";
import { Campaign } from "@prisma/client";
import { getFormFields } from "~/util.server";
import { createSession } from "~/queries/sessions.server";
import { requireUserId } from "~/session.server";
import { getCampaign } from "~/queries/campaigns.server";
import { getParams } from "~/util";

interface Props {
  params: {
    campaignId: string;
  };
}
export default function EditSession({ params }: Props) {
  const { campaign } = useLoaderData<LoaderData>();

  return (
    <FormPage
      heading="Add session"
      formId="add-session-form"
      breadcrumbs={[
        { text: "Campaigns", href: "/campaigns" },
        { text: campaign.name, href: `/campaigns/${campaign.id}` },
      ]}
    >
      <input type="hidden" name="campaignId" value={campaign.id} />
      <TextField name="name" label="Name:" />

      <TextareaField name="summary" label="Summary:" rows={3} />
      <TextareaField name="notes" label="Notes:" rows={6} />
      <TextareaField name="privateNotes" label="Private Notes:" rows={6} />
    </FormPage>
  );
}

export const meta: MetaFunction = ({
  data,
}: {
  data: LoaderData | undefined;
}) => ({ title: data ? `Add session - ${data.campaign.name}` : "" });

type LoaderData = {
  sessionType: string;
  campaign: Campaign;
};
export let loader: LoaderFunction = async ({ request, params }) => {
  const { campaignId } = getParams(params, ["campaignId"] as const);
  const userId = await requireUserId(request);

  const campaign = await getCampaign({ campaignId, userId });

  return { campaign };
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const { fields } = await getFormFields({
    request,
  });

  const session = await createSession({ userId, fields });

  return redirect(`/campaigns/${fields.campaignId}/sessions/${session.id}`);
};

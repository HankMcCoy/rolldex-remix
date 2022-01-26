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
import { db } from "~/db.server";
import { getFormFields } from "~/util.server";

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
  const { campaignId } = params;

  if (!campaignId) throw new Error("sessionId and campaignId required");
  const campaign = await db.campaign.findUnique({ where: { id: campaignId } });
  return { campaign };
};

export const action: ActionFunction = async ({ request }) => {
  const { fields } = await getFormFields({
    request,
  });
  const session = await db.session.create({
    data: {
      campaignId: fields.campaignId,
      name: fields.name,
      summary: fields.summary,
      notes: fields.notes,
      privateNotes: fields.privateNotes,
    },
  });
  return redirect(`/campaigns/${fields.campaignId}/sessions/${session.id}`);
};

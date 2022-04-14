import { FormPage } from "~/components/layout";
import {
  LoaderFunction,
  ActionFunction,
  useLoaderData,
  redirect,
  MetaFunction,
} from "remix";
import { TextField, TextareaField } from "~/components/forms";
import { Campaign, Session } from "@prisma/client";
import { getFormFields } from "~/util.server";
import { requireUserId } from "~/session.server";
import { getParams } from "~/util";
import {
  getSessionAndCampaign,
  updateSession,
} from "~/queries/sessions.server";

export default function EditSession() {
  const { session, campaign } = useLoaderData<LoaderData>();

  return (
    <FormPage
      heading={session.name}
      formId="edit-session-form"
      breadcrumbs={[
        { text: "Campaigns", href: "/campaigns" },
        { text: campaign.name, href: `/campaigns/${campaign.id}` },
      ]}
    >
      <input type="hidden" name="campaignId" value={campaign.id} />
      <input type="hidden" name="sessionId" value={session.id} />
      <TextField name="name" label="Name:" defaultValue={session.name} />
      <TextareaField
        name="summary"
        label="Summary:"
        defaultValue={session.summary}
        rows={3}
      />
      <TextareaField
        name="notes"
        label="Notes:"
        defaultValue={session.notes}
        rows={6}
      />
      <TextareaField
        name="privateNotes"
        label="Private Notes:"
        defaultValue={session.privateNotes}
        rows={6}
      />
    </FormPage>
  );
}

export const meta: MetaFunction = ({
  data,
}: {
  data: LoaderData | undefined;
}) => ({
  title: data ? `Edit ${data.session.name} - ${data.campaign.name}` : "",
});

type LoaderData = {
  session: Session;
  campaign: Campaign;
};
export let loader: LoaderFunction = async ({ request, params }) => {
  const { sessionId, campaignId } = getParams(params, [
    "sessionId",
    "campaignId",
  ] as const);
  const userId = await requireUserId(request);
  const { campaign, session } = await getSessionAndCampaign({
    sessionId,
    campaignId,
    userId,
  });
  return { session, campaign };
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const {
    fields: { campaignId, sessionId, name, summary, notes, privateNotes },
  } = await getFormFields({ request });

  await updateSession({
    userId,
    campaignId,
    sessionId,
    data: { name, summary, notes, privateNotes },
  });

  return redirect(`/campaigns/${campaignId}/sessions/${sessionId}`);
};

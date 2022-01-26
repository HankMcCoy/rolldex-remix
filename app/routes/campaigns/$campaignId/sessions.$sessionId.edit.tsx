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
import { db } from "~/db.server";
import { getFormFields } from "~/util.server";

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
export let loader: LoaderFunction = async ({ params }) => {
  const { sessionId, campaignId } = params;
  if (!sessionId || !campaignId)
    throw new Error("sessionId and campaignId required");
  const [campaign, session] = await Promise.all([
    db.campaign.findUnique({ where: { id: campaignId } }),
    db.session.findUnique({ where: { id: sessionId } }),
  ]);
  return { session, campaign };
};

export const action: ActionFunction = async ({ request }) => {
  const {
    fields: { campaignId, sessionId, name, summary, notes, privateNotes },
  } = await getFormFields({ request });

  await db.session.update({
    where: { id: sessionId },
    data: { name, summary, notes, privateNotes },
  });

  return redirect(`/campaigns/${campaignId}/sessions/${sessionId}`);
};

import { FormPage } from "~/components/layout";
import { getNounTypeFromUrlFragment, nounTypeUrlFragment } from "~/fake-data";
import { LoaderFunction, ActionFunction, useLoaderData, redirect } from "remix";
import { TextField, TextareaField, LabelRow } from "~/components/forms";
import { Campaign } from "@prisma/client";
import { db } from "~/db.server";
import { getFormFields } from "~/util.server";

interface Props {
  params: {
    campaignId: string;
  };
}
export default function EditNoun({ params }: Props) {
  const { nounType, campaign } = useLoaderData<LoaderData>();

  return (
    <FormPage
      heading="Add noun"
      formId="add-noun-form"
      breadcrumbs={[
        { text: "Campaigns", href: "/campaigns" },
        { text: campaign.name, href: `/campaigns/${campaign.id}` },
      ]}
      backHref={`/campaigns/${campaign.id}/nouns?nounType=${nounType}`}
    >
      <input type="hidden" name="campaignId" value={campaign.id} />
      <TextField name="name" label="Name:" />
      <LabelRow label="Noun Type">
        <select
          name="nounType"
          className="w-full"
          required
          defaultValue={getNounTypeFromUrlFragment(nounType)}
        >
          <option></option>
          <option value="PERSON">Person</option>
          <option value="PLACE">Place</option>
          <option value="THING">Thing</option>
          <option value="FACTION">Faction</option>
        </select>
      </LabelRow>
      <TextareaField name="summary" label="Summary:" rows={3} />
      <TextareaField name="notes" label="Notes:" rows={6} />
      <TextareaField name="privateNotes" label="Private Notes:" rows={6} />
    </FormPage>
  );
}

type LoaderData = {
  nounType: string;
  campaign: Campaign;
};
export let loader: LoaderFunction = async ({ request, params }) => {
  const { campaignId } = params;

  const url = new URL(request.url);
  const nounType = url.searchParams.get("nounType");
  if (!campaignId) throw new Error("nounId and campaignId required");
  const campaign = await db.campaign.findUnique({ where: { id: campaignId } });
  return { nounType, campaign };
};

export const action: ActionFunction = async ({ request }) => {
  const { fields } = await getFormFields({
    request,
  });
  const noun = await db.noun.create({
    data: {
      campaignId: fields.campaignId,
      name: fields.name,
      summary: fields.summary,
      nounType: fields.nounType,
      notes: fields.notes,
      privateNotes: fields.privateNotes,
    },
  });
  return redirect(`/campaigns/${fields.campaignId}/nouns/${noun.id}`);
};

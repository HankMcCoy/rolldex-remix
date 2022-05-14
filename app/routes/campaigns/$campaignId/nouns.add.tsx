import { FormPage } from "~/components/layout";
import { getNounTypeFromUrlFragment } from "~/fake-data";
import {
  LoaderFunction,
  ActionFunction,
  useLoaderData,
  redirect,
  MetaFunction,
} from "remix";
import { TextField, TextareaField, LabelRow } from "~/components/forms";
import { Campaign } from "@prisma/client";
import { getFormFields } from "~/util.server";
import { getCampaign } from "~/queries/campaigns.server";
import { getParams } from "~/util";
import { requireUserId } from "~/session.server";
import { createNoun } from "~/queries/nouns.server";

export default function AddNoun() {
  const { nounType, campaign, name } = useLoaderData<LoaderData>();

  return (
    <FormPage
      heading="Add noun"
      formId="add-noun-form"
      breadcrumbs={[
        { text: "Campaigns", href: "/campaigns" },
        { text: campaign.name, href: `/campaigns/${campaign.id}` },
      ]}
    >
      <input type="hidden" name="campaignId" value={campaign.id} />
      <TextField name="name" label="Name:" defaultValue={name} autoFocus />
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

export const meta: MetaFunction = ({
  data,
}: {
  data: LoaderData | undefined;
}) => ({ title: data ? `Add noun - ${data.campaign.name}` : "" });

type LoaderData = {
  nounType: string;
  campaign: Campaign;
  name: string | undefined;
};
export let loader: LoaderFunction = async ({ request, params }) => {
  const { campaignId } = getParams(params, ["campaignId"] as const);
  const userId = await requireUserId(request);

  const url = new URL(request.url);
  const nounType = url.searchParams.get("nounType");
  const name = url.searchParams.get("name") || undefined;

  const campaign = await getCampaign({ campaignId, userId });

  return { nounType, campaign, name };
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const { fields } = await getFormFields({
    request,
  });
  const noun = await createNoun({ fields, userId });
  return redirect(`/campaigns/${fields.campaignId}/nouns/${noun.id}`);
};

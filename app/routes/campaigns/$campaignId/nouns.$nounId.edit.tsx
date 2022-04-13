import { FormPage } from "~/components/layout";
import { nounTypePluralDisplayText, nounTypeUrlFragment } from "~/fake-data";
import {
  LoaderFunction,
  ActionFunction,
  useLoaderData,
  redirect,
  MetaFunction,
} from "remix";
import {
  TextField,
  TextareaField,
  MarkdownField,
  LabelRow,
} from "~/components/forms";
import { Campaign, Noun } from "@prisma/client";
import { db } from "~/db.server";
import { getFormFields } from "~/util.server";
import { getNounAndCampaign } from "~/queries/nouns.server";
import { requireUser, requireUserId } from "~/session.server";
import { enforceWriteAccess } from "~/queries/campaigns.server";
import { getParams } from "~/util";

export const meta: MetaFunction = ({
  data,
}: {
  data: LoaderData | undefined;
}) => ({
  title: data ? `Edit ${data.noun.name} - ${data.campaign.name}` : "",
});

export default function EditNoun() {
  const { noun, campaign } = useLoaderData<LoaderData>();
  const nounTypeUrl = nounTypeUrlFragment[noun.nounType];

  return (
    <FormPage
      heading={noun.name}
      formId="add-noun-form"
      breadcrumbs={[
        { text: "Campaigns", href: "/campaigns" },
        { text: campaign.name, href: `/campaigns/${campaign.id}` },
        {
          text: nounTypePluralDisplayText[noun.nounType],
          href: `/campaigns/${campaign.id}/nouns?nounType=${nounTypeUrl}`,
        },
      ]}
    >
      <input type="hidden" name="campaignId" value={campaign.id} />
      <input type="hidden" name="nounId" value={noun.id} />
      <TextField name="name" label="Name:" defaultValue={noun.name} />
      <LabelRow label="Noun Type">
        <select
          name="nounType"
          className="w-full"
          required
          defaultValue={noun.nounType}
        >
          <option></option>
          <option value="PERSON">Person</option>
          <option value="PLACE">Place</option>
          <option value="THING">Thing</option>
          <option value="FACTION">Faction</option>
        </select>
      </LabelRow>
      <TextareaField
        name="summary"
        label="Summary:"
        defaultValue={noun.summary}
        rows={3}
      />
      <MarkdownField name="notes" label="Notes:" defaultValue={noun.notes} />
      <TextareaField
        name="privateNotes"
        label="Private Notes:"
        defaultValue={noun.privateNotes}
        rows={6}
      />
    </FormPage>
  );
}

type LoaderData = {
  noun: Noun;
  campaign: Campaign;
};
export let loader: LoaderFunction = async ({ params, request }) => {
  const userId = await requireUserId(request);
  const { nounId, campaignId } = getParams(params, [
    "nounId",
    "campaignId",
  ] as const);

  const { noun, campaign } = await getNounAndCampaign({
    nounId,
    campaignId,
    userId,
  });

  return { noun, campaign };
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const {
    fields: { campaignId, nounId, name, summary, notes, privateNotes },
  } = await getFormFields({ request });

  enforceWriteAccess({ campaignId, userId });

  await db.noun.update({
    where: { id: nounId },
    data: { name, summary, notes, privateNotes },
  });

  return redirect(`/campaigns/${campaignId}/nouns/${nounId}`);
};

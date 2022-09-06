import { FormPage } from "~/components/layout";
import {
  nounTypePluralDisplayText,
  nounTypeUrlFragment,
} from "~/util/noun-type-helpers";
import {
  LoaderFunction,
  ActionFunction,
  useLoaderData,
  redirect,
  MetaFunction,
  useActionData,
  json,
} from "remix";
import { z } from "zod";

import { Campaign, Noun } from "@prisma/client";
import { getFormFields } from "~/util.server";
import { getNounAndCampaign, updateNoun } from "~/queries/nouns.server";
import { requireUserId } from "~/session.server";
import { getParams } from "~/util";
import { getFields } from "~/components/nouns/fields";

export const meta: MetaFunction = ({
  data,
}: {
  data: LoaderData | undefined;
}) => ({
  title: data ? `Edit ${data.noun.name} - ${data.campaign.name}` : "",
});

export default function EditNoun() {
  const { noun, campaign } = useLoaderData<LoaderData>();
  const { errors } = useActionData<ActionData>() ?? {};
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
      {getFields({
        data: { ...noun, campaignId: campaign.id },
        errors: errors ?? {},
      })}
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

const validation = z.object({
  campaignId: z.string(),
  nounId: z.string(),
  name: z.string().min(1, "Required"),
  summary: z.string().min(1, "Required"),
  nounType: z.string(),
  notes: z.string(),
  privateNotes: z.string(),
});
type Fields = z.infer<typeof validation>;
type FieldErrors = Partial<{ [K in keyof Fields]: string[] }>;
type ActionData =
  | {
      errors: FieldErrors;
    }
  | undefined;
export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const { fields } = await getFormFields({ request });

  const parseResult = validation.safeParse(fields);
  if (!parseResult.success) {
    return json<ActionData>({
      errors: parseResult.error.flatten().fieldErrors,
    });
  }

  const { campaignId, nounId, name, summary, notes, privateNotes, nounType } =
    parseResult.data;
  await updateNoun({
    userId,
    campaignId,
    nounId,
    data: { name, summary, notes, privateNotes, nounType },
  });

  return redirect(`/campaigns/${campaignId}/nouns/${nounId}`);
};

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
} from "remix";
import { z } from "zod";

import { Campaign, Noun } from "@prisma/client";
import { getFormFields } from "~/util.server";
import { badRequest } from "~/util/http-errors.server";
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
  const actionData = useActionData<ActionData>();
  const nounTypeUrl = nounTypeUrlFragment[noun.nounType];

  return (
    <FormPage
      heading={noun.name}
      formId="edit-noun-form"
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
        data: { ...noun, ...actionData?.fields, campaignId: campaign.id },
        errors: actionData?.errors?.fieldErrors ?? {},
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

const fieldTypeSchema = {
  campaignId: z.string(),
  nounId: z.string(),
  name: z.string(),
  summary: z.string(),
  nounType: z.string(),
  notes: z.string(),
  privateNotes: z.string(),
};
const fieldTypeValidation = z.object(fieldTypeSchema);
const validation = z.object({
  ...fieldTypeSchema,
  name: fieldTypeSchema.name.min(1, "Required"),
  summary: fieldTypeSchema.summary.min(1, "Required"),
});
type Fields = z.infer<typeof fieldTypeValidation>;
type ActionData = {
  errors: z.typeToFlattenedError<Fields>;
  fields: Fields;
};
export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const fields = fieldTypeValidation.parse(await getFormFields({ request }));

  const parseResult = validation.safeParse(fields);
  if (!parseResult.success) {
    return badRequest<ActionData>({
      fields,
      errors: parseResult.error.flatten(),
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

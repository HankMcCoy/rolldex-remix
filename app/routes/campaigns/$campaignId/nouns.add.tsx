import { FormPage } from "~/components/layout";
import { getNounTypeFromUrlFragment } from "~/util/noun-type-helpers";
import {
  LoaderFunction,
  ActionFunction,
  useLoaderData,
  redirect,
  MetaFunction,
  json,
  useActionData,
} from "remix";
import { z } from "zod";

import { Campaign } from "@prisma/client";
import { getFormFields } from "~/util.server";
import { getCampaign } from "~/queries/campaigns.server";
import { getParams } from "~/util";
import { requireUserId } from "~/session.server";
import { createNoun } from "~/queries/nouns.server";
import { getFields } from "~/components/nouns/fields";

export default function AddNoun() {
  const { nounType, campaign, name } = useLoaderData<LoaderData>();
  const { errors } = useActionData<ActionData>() ?? {};

  return (
    <FormPage
      heading="Add noun"
      formId="add-noun-form"
      breadcrumbs={[
        { text: "Campaigns", href: "/campaigns" },
        { text: campaign.name, href: `/campaigns/${campaign.id}` },
      ]}
    >
      {getFields({
        data: {
          campaignId: campaign.id,
          name,
          nounType: getNounTypeFromUrlFragment(nounType),
        },
        errors: errors ?? {},
      })}
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

const validation = z.object({
  campaignId: z.string(),
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
  const { fields } = await getFormFields({
    request,
  });

  const parseResult = validation.safeParse(fields);
  if (!parseResult.success) {
    return json<ActionData>({
      errors: parseResult.error.flatten().fieldErrors,
    });
  }

  const noun = await createNoun({ userId, data: parseResult.data });
  return redirect(`/campaigns/${fields.campaignId}/nouns/${noun.id}`);
};

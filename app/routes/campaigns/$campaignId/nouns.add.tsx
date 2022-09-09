import { FormPage } from "~/components/layout";
import { getNounTypeFromUrlFragment } from "~/util/noun-type-helpers";
import {
  LoaderFunction,
  ActionFunction,
  useLoaderData,
  redirect,
  MetaFunction,
  useActionData,
} from "remix";
import { z } from "zod";

import { Campaign } from "@prisma/client";
import { getFormFields } from "~/util.server";
import { badRequest } from "~/util/http-errors.server";
import { getCampaign } from "~/queries/campaigns.server";
import { getParams } from "~/util";
import { requireUserId } from "~/session.server";
import { createNoun } from "~/queries/nouns.server";
import { NounFields } from "~/components/nouns/noun-fields";
import { basicEntityValidation } from "~/shared/validations/basic-entity";
import { DuplicateNameError } from "~/queries/errors.server";

export default function AddNoun() {
  const { nounType, campaign, name } = useLoaderData<LoaderData>();
  const { fieldErrors } = useActionData<ActionData>() ?? {};

  return (
    <FormPage
      heading="Add noun"
      formId="add-noun-form"
      breadcrumbs={[
        { text: "Campaigns", href: "/campaigns" },
        { text: campaign.name, href: `/campaigns/${campaign.id}` },
      ]}
    >
      <NounFields
        data={{
          campaignId: campaign.id,
          name,
          nounType: getNounTypeFromUrlFragment(nounType),
        }}
        errors={fieldErrors ?? {}}
      />
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

const validation = basicEntityValidation.merge(
  z.object({ nounType: z.string() })
);
type Fields = z.infer<typeof validation>;
type ActionData = z.typeToFlattenedError<Fields> | undefined;
export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const fields = await getFormFields({
    request,
  });

  const parseResult = validation.safeParse(fields);
  if (!parseResult.success) {
    return badRequest<ActionData>(parseResult.error.flatten());
  }

  let noun;
  try {
    noun = await createNoun({ userId, data: parseResult.data });
  } catch (e) {
    if (e instanceof DuplicateNameError) {
      return badRequest<ActionData>({
        fieldErrors: { name: ["Must be unique"] },
        formErrors: [],
      });
    }
    throw e;
  }
  return redirect(`/campaigns/${fields.campaignId}/nouns/${noun.id}`);
};

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
import { NounFields } from "~/components/nouns/noun-fields";
import { basicEntityValidation } from "~/shared/validations/basic-entity";
import { DuplicateNameError } from "~/queries/errors.server";
import { enforceWriteAccess } from "~/queries/campaigns.server";

export const meta: MetaFunction = ({
  data,
}: {
  data: LoaderData | undefined;
}) => ({
  title: data ? `Edit ${data.noun.name} - ${data.campaign.name}` : "",
});

export default function EditNoun() {
  const { noun, campaign } = useLoaderData<LoaderData>();
  const errors = useActionData<ActionData>();
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
      <NounFields
        data={{ ...noun, campaignId: campaign.id }}
        errors={errors?.fieldErrors ?? {}}
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

  const [{ noun, campaign }] = await Promise.all([
    getNounAndCampaign({
      nounId,
      campaignId,
      userId,
    }),
    enforceWriteAccess({ campaignId, userId }),
  ]);

  return { noun, campaign };
};

const validation = basicEntityValidation.merge(
  z.object({
    nounId: z.string(),
    nounType: z.string(),
  })
);
type Fields = z.infer<typeof validation>;
type ActionData = z.typeToFlattenedError<Fields> | undefined;
export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const fields = await getFormFields({ request });

  const parseResult = validation.safeParse(fields);
  if (!parseResult.success) {
    return badRequest<ActionData>(parseResult.error.flatten());
  }

  const { campaignId, nounId, ...noun } = parseResult.data;
  try {
    await updateNoun({
      userId,
      campaignId,
      nounId,
      data: noun,
    });
  } catch (e) {
    if (e instanceof DuplicateNameError) {
      return badRequest<ActionData>({
        fieldErrors: { name: ["Must be unique"] },
        formErrors: [],
      });
    }
    throw e;
  }

  return redirect(`/campaigns/${campaignId}/nouns/${nounId}`);
};

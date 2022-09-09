import { FormPage } from "~/components/layout";
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
import { createSession } from "~/queries/sessions.server";
import { requireUserId } from "~/session.server";
import { getCampaign } from "~/queries/campaigns.server";
import { getParams } from "~/util";
import { badRequest } from "~/util/http-errors.server";
import { SessionFields } from "~/components/sessions/session-fields";
import { DuplicateNameError } from "~/queries/errors.server";
import { basicEntityValidation } from "~/shared/validations/basic-entity";

interface Props {
  params: {
    campaignId: string;
  };
}
export default function AddSession({ params }: Props) {
  const { campaign } = useLoaderData<LoaderData>();
  const errors = useActionData<ActionData>();

  return (
    <FormPage
      heading="Add session"
      formId="add-session-form"
      breadcrumbs={[
        { text: "Campaigns", href: "/campaigns" },
        { text: campaign.name, href: `/campaigns/${campaign.id}` },
      ]}
    >
      <input type="hidden" name="campaignId" value={campaign.id} />
      <SessionFields errors={errors?.fieldErrors} />
    </FormPage>
  );
}

export const meta: MetaFunction = ({
  data,
}: {
  data: LoaderData | undefined;
}) => ({ title: data ? `Add session - ${data.campaign.name}` : "" });

type LoaderData = {
  sessionType: string;
  campaign: Campaign;
};
export let loader: LoaderFunction = async ({ request, params }) => {
  const { campaignId } = getParams(params, ["campaignId"] as const);
  const userId = await requireUserId(request);

  const campaign = await getCampaign({ campaignId, userId });

  return { campaign };
};

const validation = basicEntityValidation;
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

  let session;
  try {
    session = await createSession({ userId, data: parseResult.data });
  } catch (e) {
    if (e instanceof DuplicateNameError) {
      return badRequest<ActionData>({
        fieldErrors: { name: ["Must be unique"] },
        formErrors: [],
      });
    }
    throw e;
  }

  return redirect(`/campaigns/${fields.campaignId}/sessions/${session.id}`);
};

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
import { Campaign, Session } from "@prisma/client";
import { getFormFields } from "~/util.server";
import { requireUserId } from "~/session.server";
import { getParams } from "~/util";
import {
  getSessionAndCampaign,
  updateSession,
} from "~/queries/sessions.server";
import { badRequest } from "~/util/http-errors.server";
import { SessionFields } from "~/components/sessions/session-fields";
import { DuplicateNameError } from "~/queries/errors.server";
import { basicEntityValidation } from "~/shared/validations/basic-entity";

export default function EditSession() {
  const { session, campaign } = useLoaderData<LoaderData>();
  const errors = useActionData<ActionData>();

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
      <SessionFields data={session} errors={errors?.fieldErrors} />
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
export let loader: LoaderFunction = async ({ request, params }) => {
  const { sessionId, campaignId } = getParams(params, [
    "sessionId",
    "campaignId",
  ] as const);
  const userId = await requireUserId(request);
  const { campaign, session } = await getSessionAndCampaign({
    sessionId,
    campaignId,
    userId,
  });
  return { session, campaign };
};

const validation = basicEntityValidation.merge(
  z.object({
    sessionId: z.string(),
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
  const { campaignId, sessionId, ...session } = parseResult.data;

  try {
    await updateSession({
      userId,
      campaignId,
      sessionId,
      data: session,
    });
  } catch (e) {
    if (e instanceof DuplicateNameError) {
      return badRequest<ActionData>({
        fieldErrors: { name: ["Must be unique"] },
        formErrors: [],
      });
    } else {
      throw e;
    }
  }

  return redirect(`/campaigns/${campaignId}/sessions/${sessionId}`);
};

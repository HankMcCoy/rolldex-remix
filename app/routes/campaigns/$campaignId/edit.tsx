import { HeaderLinkButton, Content, HeaderButton } from "~/components/layout";
import {
  ActionFunction,
  useTransition,
  redirect,
  Form,
  LoaderFunction,
  useLoaderData,
} from "remix";
import { TextField, TextareaField } from "~/components/forms";
import { CmdCtrlKey, asString } from "~/util";
import { db } from "~/db.server";
import { getUserId } from "~/session.server";
import { Campaign } from "@prisma/client";

interface LoaderData {
  campaign: Campaign;
}
export let loader: LoaderFunction = async ({ request, params }) => {
  const { campaignId } = params;
  const campaign = await db.campaign.findUnique({ where: { id: campaignId } });
  return { campaign };
};

export default function EditCampaign() {
  const transition = useTransition();
  const { campaign } = useLoaderData<LoaderData>();

  return (
    <Content
      heading={`Edit ${campaign.name}`}
      controls={
        <>
          <HeaderLinkButton
            to="/campaigns"
            data-id="cancel"
            title={`Cancel (${CmdCtrlKey}-E)`}
          >
            Cancel
          </HeaderLinkButton>
          <HeaderButton data-id="save" title={`Save (${CmdCtrlKey}-S)`}>
            Save
          </HeaderButton>
        </>
      }
    >
      <div className="flex space-x-6">
        <div className="flex-1 flex flex-col space-y-6">
          <Form method="post" className="max-w-md space-y-2">
            <fieldset disabled={transition.state === "submitting"}>
              <TextField
                label="Name:"
                name="name"
                defaultValue={campaign.name}
              />
              <TextareaField
                label="Summary:"
                name="summary"
                rows={3}
                defaultValue={campaign.summary}
              />
            </fieldset>
          </Form>
        </div>
      </div>
    </Content>
  );
}

export const action: ActionFunction = async ({ request }) => {
  const [body, userId] = await Promise.all([
    request.formData(),
    getUserId(request),
  ]);
  if (userId === null) throw new Error("Uh oh, 401");
  const name = asString(body.get("name"));
  const summary = asString(body.get("summary"));
  const newCampaign = await db.campaign.create({
    data: { name, summary, createdById: userId },
  });
  return redirect(`/campaigns/${newCampaign.id}`);
};

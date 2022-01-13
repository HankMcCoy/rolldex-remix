import { HeaderLinkButton, Content, HeaderButton } from "~/components/layout";
import {
  campaignsById,
  Noun,
  nounTypePluralDisplayText,
  nounTypeUrlFragment,
  Campaign,
  nounsById,
} from "~/fake-data";
import {
  LoaderFunction,
  ActionFunction,
  useLoaderData,
  useTransition,
  redirect,
  Form,
} from "remix";
import { TextField, TextareaField } from "~/components/forms";
import { CmdCtrlKey } from "~/util";

interface Props {
  params: {
    campaignId: string;
  };
}
export default function EditNoun({ params }: Props) {
  const { noun, campaign } = useLoaderData<LoaderData>();
  const transition = useTransition();

  return (
    <Content
      heading={noun.name}
      breadcrumbs={[
        { text: "Campaigns", href: "/campaigns" },
        { text: campaign.name, href: `/campaigns/${campaign.id}` },
        {
          text: nounTypePluralDisplayText[noun.noun_type],
          href: `/campaigns/${campaign.id}/nouns?nounType=${
            nounTypeUrlFragment[noun.noun_type]
          }`,
        },
      ]}
      controls={
        <>
          <HeaderLinkButton
            to={`/campaigns/${campaign.id}/nouns/${noun.id}`}
            data-id="cancel"
            title={`Cancel (${CmdCtrlKey}-E)`}
          >
            Cancel
          </HeaderLinkButton>
          <HeaderButton
            data-id="save"
            title={`Save (${CmdCtrlKey}-S)`}
            type="primary"
          >
            Save
          </HeaderButton>
        </>
      }
    >
      <div className="flex space-x-6">
        <div className="flex-1 flex flex-col space-y-6">
          <Form
            method="post"
            action={`/campaigns/${campaign.id}/nouns/${noun.id}/edit`}
            className="max-w-md space-y-2"
          >
            <fieldset disabled={transition.state === "submitting"}>
              <input type="hidden" name="campaignId" value={campaign.id} />
              <input type="hidden" name="nounId" value={noun.id} />
              <TextField label="Name:" defaultValue={noun.name} />
              <TextareaField
                label="Summary:"
                defaultValue={noun.summary}
                rows={3}
              />
              <TextareaField
                label="Notes:"
                defaultValue={noun.notes}
                rows={6}
              />
              <TextareaField
                label="Private Notes:"
                defaultValue={noun.private_notes}
                rows={6}
              />
            </fieldset>
          </Form>
        </div>
      </div>
    </Content>
  );
}

type LoaderData = {
  noun: Noun;
  campaign: Campaign;
};
export let loader: LoaderFunction = ({ params }) => {
  const { nounId, campaignId } = params;
  if (!nounId || !campaignId) throw new Error("nounId and campaignId required");
  const noun = nounsById[nounId];
  const campaign = campaignsById[campaignId];
  return { noun, campaign };
};

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();
  const campaignId = body.get("campaignId");
  const nounId = body.get("nounId");
  return redirect(`/campaigns/${campaignId}/nouns/${nounId}`);
};

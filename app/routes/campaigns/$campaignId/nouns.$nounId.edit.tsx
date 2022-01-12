import { HeaderLinkButton, Content, HeaderButton } from "~/components/layout";
import {
  campaignsById,
  Noun,
  nounTypePluralDisplayText,
  nounTypeUrlFragment,
  Campaign,
  nounsById,
} from "~/fake-data";
import { LoaderFunction, useLoaderData } from "remix";
import { TextField, TextareaField } from "~/components/forms";
import { CmdCtrlKey } from "~/util";

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

interface Props {
  params: {
    campaignId: string;
  };
}
export default function EditNoun({ params }: Props) {
  const { noun, campaign } = useLoaderData<LoaderData>();

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
          <HeaderButton data-id="save" title={`Save (${CmdCtrlKey}-S)`}>
            Save
          </HeaderButton>
        </>
      }
    >
      <div className="flex space-x-6">
        <div className="flex-1 flex flex-col space-y-6">
          <form
            method="post"
            action={`/campaigns/${campaign.id}/nouns/${noun.id}/edit`}
            className="max-w-md space-y-2"
          >
            <TextField label="Name:" defaultValue={noun.name} />
            <TextareaField
              label="Summary:"
              defaultValue={noun.summary}
              rows={3}
            />
            <TextareaField label="Notes:" defaultValue={noun.notes} rows={6} />
            <TextareaField
              label="Private Notes:"
              defaultValue={noun.private_notes}
              rows={6}
            />
          </form>
        </div>
      </div>
    </Content>
  );
}

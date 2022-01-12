import { HeaderLinkButton, Content } from "~/components/layout";
import { Markdown } from "~/components/markdown";
import {
  campaignsById,
  Noun,
  nounTypePluralDisplayText,
  nounTypeUrlFragment,
  Campaign,
  nounsById,
} from "~/fake-data";
import { LoaderFunction, useLoaderData } from "remix";
import { TitledSection } from "~/components/titled-section";

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
export default function ViewNoun({ params }: Props) {
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
        <HeaderLinkButton
          to={`/campaigns/${campaign.id}/nouns/${noun.id}/edit`}
          data-id="edit"
          title="Edit (Ctrl/Cmd-E)"
        >
          Edit
        </HeaderLinkButton>
      }
    >
      <div className="flex space-x-6">
        <div className="flex-1 flex flex-col space-y-6">
          <TitledSection title="Summary">{noun.summary}</TitledSection>
          <TitledSection title="Notes">
            <Markdown>{noun.notes}</Markdown>
          </TitledSection>
          <TitledSection title="Private Notes">
            <Markdown>{noun.private_notes}</Markdown>
          </TitledSection>
        </div>
      </div>
    </Content>
  );
}

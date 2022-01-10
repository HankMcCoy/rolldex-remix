import { Content } from "~/components/layout";
import {
  campaignsById,
  Noun,
  nounTypePluralDisplayText,
  nounTypeUrlFragment,
  Campaign,
  nounsById,
} from "~/fake-data";
import { LoaderFunction, useLoaderData } from "remix";

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
export default function ViewCampaign({ params }: Props) {
  const { noun, campaign } = useLoaderData<LoaderData>();

  return (
    <Content
      heading={campaign.name}
      breadcrumbs={[
        { text: "Campaigns", href: "/campaigns" },
        { text: campaign.name, href: `/campaigns/${campaign.id}` },
        {
          text: nounTypePluralDisplayText[noun.noun_type],
          href: `/campaigns/${campaign.id}/nouns?nounType=${
            nounTypeUrlFragment[noun.noun_type]
          }`,
        },
        {
          text: noun.name,
          href: `/campaigns/${campaign.id}/nouns/${noun.id}`,
        },
      ]}
    >
      <div className="flex space-x-6">
        <div className="flex-1 flex flex-col space-y-6">{noun.name}</div>
      </div>
    </Content>
  );
}

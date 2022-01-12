import { useCallback } from "react";
import { Content } from "~/components/layout";
import { LinkBox } from "~/components/link-box";
import { TitledSection } from "~/components/titled-section";
import { AddableList } from "~/components/addable-list";
import {
  campaignsById,
  sessions,
  members,
  nouns,
  Noun,
  Campaign,
} from "~/fake-data";
import { LoaderFunction, useLoaderData } from "remix";

const people = nouns.filter((n) => n.noun_type === "PERSON");
const places = nouns.filter((n) => n.noun_type === "PLACE");
const things = nouns.filter((n) => n.noun_type === "THING");
const factions = nouns.filter((n) => n.noun_type === "FACTION");

type LoaderData = {
  campaign: Campaign;
  id: string;
};
export let loader: LoaderFunction = ({ params }) => {
  const { campaignId } = params;
  if (!campaignId) throw new Error("campaignId required");
  const campaign = campaignsById[campaignId];
  const result: LoaderData = { campaign, id: campaignId };
  return result;
};

interface Props {
  params: {
    campaignId: string;
  };
}
export default function ViewCampaign({ params }: Props) {
  const { campaign, id } = useLoaderData<LoaderData>();
  const getNounEl = useCallback(
    (n: Noun) => (
      <LinkBox
        title={n.name}
        desc={n.summary}
        href={`/campaigns/${id}/nouns/${n.id}`}
      />
    ),
    [id]
  );

  return (
    <Content
      heading={campaign.name}
      breadcrumbs={[{ text: "Campaigns", href: "/campaigns" }]}
    >
      <div className="flex space-x-6">
        <div className="flex-1 flex flex-col space-y-6">
          <TitledSection title="Description">
            {campaign.description}
          </TitledSection>
          <TitledSection title="Members">
            <div className="flex flex-col space-y-2">
              {members.map((m) => (
                <LinkBox title={m.email} href="#" />
              ))}
            </div>
          </TitledSection>
          <TitledSection title="Sessions">
            <div className="flex flex-col space-y-2">
              {sessions.map((s) => (
                <LinkBox
                  title={s.name}
                  desc={s.summary}
                  href={`/campaigns/${id}/sessions/${s.id}`}
                />
              ))}
            </div>
          </TitledSection>
        </div>
        <div className="flex-1 flex flex-col space-y-6">
          <AddableList
            title="People"
            seeAllHref={`/campaigns/${id}/nouns?nounType=people`}
            entities={people}
            getListItem={getNounEl}
          />
          <AddableList
            title="Factions"
            seeAllHref={`/campaigns/${id}/nouns?nounType=factions`}
            entities={factions}
            getListItem={getNounEl}
          />
          <AddableList
            title="Places"
            seeAllHref={`/campaigns/${id}/nouns?nounType=places`}
            entities={places}
            getListItem={getNounEl}
          />
          <AddableList
            title="Things"
            seeAllHref={`/campaigns/${id}/nouns?nounType=things`}
            entities={things}
            getListItem={getNounEl}
          />
        </div>
      </div>
    </Content>
  );
}

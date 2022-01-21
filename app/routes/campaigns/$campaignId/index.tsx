import { useCallback } from "react";
import { Content, LinkButton } from "~/components/layout";
import { LinkBox } from "~/components/link-box";
import { TitledSection } from "~/components/titled-section";
import { AddableList } from "~/components/addable-list";

import { LoaderFunction, useLoaderData } from "remix";
import { Campaign, Noun, Member, Session } from ".prisma/client";
import { db } from "~/db.server";

type LoaderData = {
  id: string;
  campaign: Campaign;
  people: Array<Noun>;
  places: Array<Noun>;
  things: Array<Noun>;
  factions: Array<Noun>;
  members: Array<Member>;
  sessions: Array<Session>;
};
export let loader: LoaderFunction = async ({ params }): Promise<LoaderData> => {
  const { campaignId } = params;
  if (!campaignId) throw new Response("Bad Request", { status: 400 });

  const [campaign, people, places, things, factions, sessions, members] =
    await Promise.all([
      db.campaign.findUnique({ where: { id: campaignId } }),
      db.noun.findMany({
        where: { campaignId, nounType: "PERSON" },
        orderBy: { name: "asc" },
        take: 3,
      }),
      db.noun.findMany({
        where: { campaignId, nounType: "PLACE" },
        orderBy: { name: "asc" },
        take: 3,
      }),
      db.noun.findMany({
        where: { campaignId, nounType: "THING" },
        orderBy: { name: "asc" },
        take: 3,
      }),
      db.noun.findMany({
        where: { campaignId, nounType: "FACTION" },
        orderBy: { name: "asc" },
        take: 3,
      }),
      db.session.findMany({ where: { campaignId } }),
      db.member.findMany({ where: { campaignId } }),
    ]);
  if (!campaign) throw new Response("Not Found", { status: 404 });

  return {
    campaign,
    id: campaignId,
    people,
    places,
    things,
    factions,
    sessions,
    members,
  };
};

interface Props {
  params: {
    campaignId: string;
  };
}
export default function ViewCampaign({ params }: Props) {
  const { campaign, id, people, places, things, factions, sessions, members } =
    useLoaderData<LoaderData>();
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
      controls={
        <LinkButton
          to={`/campaigns/${id}/edit`}
          title={"Edit this campaign"}
          shortcut="mod+e"
        >
          Edit
        </LinkButton>
      }
    >
      <div className="flex space-x-6">
        <div className="flex-1 flex flex-col space-y-6">
          <TitledSection title="Summary">{campaign.summary}</TitledSection>
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

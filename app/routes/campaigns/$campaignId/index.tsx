import { useCallback } from "react";
import { Content, LinkButton } from "~/components/layout";
import { LinkBox } from "~/components/link-box";
import { TitledSection } from "~/components/titled-section";
import { AddableList } from "~/components/addable-list";

import { LoaderFunction, MetaFunction, useLoaderData } from "remix";
import { Campaign, Noun, Member, Session } from ".prisma/client";
import { db } from "~/db.server";

export default function ViewCampaign() {
  const {
    campaign,
    id,
    people,
    numPeople,
    places,
    numPlaces,
    things,
    numThings,
    factions,
    numFactions,
    sessions,
    members,
  } = useLoaderData<LoaderData>();
  const getNounEl = useCallback(
    (n: Noun) => (
      <LinkBox
        key={n.id}
        title={n.name}
        desc={n.summary}
        href={`/campaigns/${id}/nouns/${n.id}`}
        deleteable
      />
    ),
    [id]
  );
  const getSessionEl = useCallback(
    (s: Session) => (
      <LinkBox
        key={s.id}
        title={s.name}
        desc={s.summary}
        href={`/campaigns/${id}/sessions/${s.id}`}
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
          style="darkSecondary"
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
                <LinkBox key={m.id} title={m.email} href="#" />
              ))}
            </div>
          </TitledSection>
          <AddableList
            title="Sessions"
            addHref={`/campaigns/${id}/sessions/add`}
            addTitle="Add session"
            entities={sessions}
            count={sessions.length}
            getListItem={getSessionEl}
          />
        </div>
        <div className="flex-1 flex flex-col space-y-6">
          <AddableList
            title="People"
            addHref={`/campaigns/${id}/nouns/add?nounType=people`}
            addTitle="Add person"
            seeAllHref={`/campaigns/${id}/nouns?nounType=people`}
            entities={people}
            count={numPeople}
            getListItem={getNounEl}
          />
          <AddableList
            title="Factions"
            addHref={`/campaigns/${id}/nouns/add?nounType=factions`}
            addTitle="Add faction"
            seeAllHref={`/campaigns/${id}/nouns?nounType=factions`}
            entities={factions}
            count={numFactions}
            getListItem={getNounEl}
          />
          <AddableList
            title="Places"
            addHref={`/campaigns/${id}/nouns/add?nounType=places`}
            addTitle="Add place"
            seeAllHref={`/campaigns/${id}/nouns?nounType=places`}
            entities={places}
            count={numPlaces}
            getListItem={getNounEl}
          />
          <AddableList
            title="Things"
            addHref={`/campaigns/${id}/nouns/add?nounType=things`}
            addTitle="Add thing"
            seeAllHref={`/campaigns/${id}/nouns?nounType=things`}
            entities={things}
            count={numThings}
            getListItem={getNounEl}
          />
        </div>
      </div>
    </Content>
  );
}

export const meta: MetaFunction = ({
  data,
}: {
  data: LoaderData | undefined;
}) => ({ title: data ? data.campaign.name : "" });

type LoaderData = {
  id: string;
  campaign: Campaign;
  people: Array<Noun>;
  numPeople: number;
  places: Array<Noun>;
  numPlaces: number;
  things: Array<Noun>;
  numThings: number;
  factions: Array<Noun>;
  numFactions: number;
  members: Array<Member>;
  sessions: Array<Session>;
};
export let loader: LoaderFunction = async ({ params }): Promise<LoaderData> => {
  const { campaignId } = params;
  if (!campaignId) throw new Response("Bad Request", { status: 400 });

  const [
    campaign,
    people,
    numPeople,
    places,
    numPlaces,
    things,
    numThings,
    factions,
    numFactions,
    sessions,
    members,
  ] = await Promise.all([
    db.campaign.findUnique({ where: { id: campaignId } }),
    db.noun.findMany({
      where: { campaignId, nounType: "PERSON" },
      orderBy: { name: "asc" },
      take: 3,
    }),
    db.noun.count({ where: { campaignId, nounType: "PERSON" } }),
    db.noun.findMany({
      where: { campaignId, nounType: "PLACE" },
      orderBy: { name: "asc" },
      take: 3,
    }),
    db.noun.count({ where: { campaignId, nounType: "PLACE" } }),
    db.noun.findMany({
      where: { campaignId, nounType: "THING" },
      orderBy: { name: "asc" },
      take: 3,
    }),
    db.noun.count({ where: { campaignId, nounType: "THING" } }),
    db.noun.findMany({
      where: { campaignId, nounType: "FACTION" },
      orderBy: { name: "asc" },
      take: 3,
    }),
    db.noun.count({ where: { campaignId, nounType: "FACTION" } }),
    db.session.findMany({ where: { campaignId } }),
    db.member.findMany({ where: { campaignId } }),
  ]);
  if (!campaign) throw new Response("Not Found", { status: 404 });

  return {
    campaign,
    id: campaignId,
    people,
    numPeople,
    places,
    numPlaces,
    things,
    numThings,
    factions,
    numFactions,
    sessions,
    members,
  };
};

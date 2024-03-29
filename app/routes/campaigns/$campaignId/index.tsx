import { useCallback } from "react";
import { Content, LinkButton } from "~/components/layout";
import { LinkBox } from "~/components/link-box";
import { TitledSection } from "~/components/titled-section";
import { AddableList } from "~/components/addable-list";

import { LoaderFunction, MetaFunction, useLoaderData } from "remix";
import { Campaign, Noun, Member, Session } from "@prisma/client";
import { db } from "~/db.server";
import { getNounsForCampaign } from "~/queries/nouns.server";
import { getParams } from "~/util";
import { requireUserId } from "~/session.server";
import { getMembers } from "~/queries/members.server";
import { getSessionsForCampaign } from "~/queries/sessions.server";
import { getCampaignAccessLevel } from "~/queries/campaigns.server";
import Lock from "~/components/icons/lock";

export default function ViewCampaign() {
  const {
    campaign,
    accessLevel,
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
  const isAdmin = accessLevel === "ADMIN";
  const getNounEl = useCallback(
    (n: Noun) => (
      <LinkBox
        key={n.id}
        title={
          n.isSecret ? (
            <div className="flex items-center">
              <Lock size={24} className="mr-1 -ml-1" />
              {n.name}
            </div>
          ) : (
            n.name
          )
        }
        desc={n.summary}
        href={`/campaigns/${id}/nouns/${n.id}`}
        deleteable={isAdmin}
      />
    ),
    [id]
  );
  const getSessionEl = useCallback(
    (s: Session) => (
      <LinkBox
        key={s.id}
        title={
          s.isSecret ? (
            <div className="flex items-center">
              <Lock size={24} className="mr-1 -ml-1" />
              {s.name}
            </div>
          ) : (
            s.name
          )
        }
        desc={s.summary}
        href={`/campaigns/${id}/sessions/${s.id}`}
        deleteable={isAdmin}
      />
    ),
    [id]
  );

  return (
    <Content
      heading={campaign.name}
      breadcrumbs={[{ text: "Campaigns", href: "/campaigns" }]}
      controls={
        isAdmin ? (
          <LinkButton
            to={`/campaigns/${id}/edit`}
            title={"Edit this campaign"}
            shortcut="mod+e"
            style="darkSecondary"
          >
            Edit
          </LinkButton>
        ) : null
      }
    >
      <div className="flex space-x-6">
        <div className="flex-1 flex flex-col space-y-6">
          <TitledSection title="Summary">{campaign.summary}</TitledSection>
          <TitledSection
            title="Members"
            controls={
              isAdmin ? (
                <LinkButton
                  to={`/campaigns/${campaign.id}/members/invite`}
                  title="Add new campaign member"
                  style="lightSecondary"
                  size="small"
                >
                  +
                </LinkButton>
              ) : null
            }
          >
            <div className="flex flex-col space-y-2">
              {members.map((m) => (
                <LinkBox
                  key={m.id}
                  href={`/campaigns/${campaign.id}/members/${m.id}`}
                  asLink={false}
                  title={m.email}
                  deleteable={isAdmin}
                />
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
            canAdd={isAdmin}
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
            canAdd={isAdmin}
          />
          <AddableList
            title="Factions"
            addHref={`/campaigns/${id}/nouns/add?nounType=factions`}
            addTitle="Add faction"
            seeAllHref={`/campaigns/${id}/nouns?nounType=factions`}
            entities={factions}
            count={numFactions}
            getListItem={getNounEl}
            canAdd={isAdmin}
          />
          <AddableList
            title="Places"
            addHref={`/campaigns/${id}/nouns/add?nounType=places`}
            addTitle="Add place"
            seeAllHref={`/campaigns/${id}/nouns?nounType=places`}
            entities={places}
            count={numPlaces}
            getListItem={getNounEl}
            canAdd={isAdmin}
          />
          <AddableList
            title="Things"
            addHref={`/campaigns/${id}/nouns/add?nounType=things`}
            addTitle="Add thing"
            seeAllHref={`/campaigns/${id}/nouns?nounType=things`}
            entities={things}
            count={numThings}
            getListItem={getNounEl}
            canAdd={isAdmin}
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
  accessLevel: string;
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
export let loader: LoaderFunction = async ({
  request,
  params,
}): Promise<LoaderData> => {
  const { campaignId } = getParams(params, ["campaignId"] as const);
  const userId = await requireUserId(request);
  const getNounsByType = (nounType: string) =>
    getNounsForCampaign({
      campaignId,
      userId,
      where: { nounType },
      orderBy: { name: "asc" },
      take: 3,
    });

  const [
    campaign,
    accessLevel,
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
    getCampaignAccessLevel({ campaignId, userId }),
    getNounsByType("PERSON"),
    db.noun.count({ where: { campaignId, nounType: "PERSON" } }),
    getNounsByType("PLACE"),
    db.noun.count({ where: { campaignId, nounType: "PLACE" } }),
    getNounsByType("THING"),
    db.noun.count({ where: { campaignId, nounType: "THING" } }),
    getNounsByType("FACTION"),
    db.noun.count({ where: { campaignId, nounType: "FACTION" } }),
    getSessionsForCampaign({ campaignId, userId }),
    getMembers({ campaignId, userId }),
  ]);
  if (!campaign) throw new Response("Not Found", { status: 404 });

  return {
    campaign,
    accessLevel,
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

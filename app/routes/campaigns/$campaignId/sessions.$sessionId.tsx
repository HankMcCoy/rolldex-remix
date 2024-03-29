import { Content, LinkButton, SidePanel } from "~/components/layout";
import { Markdown } from "~/components/markdown";
import {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
  redirect,
  useLoaderData,
} from "remix";
import {
  PrivateTitledSection,
  TitledSection,
} from "~/components/titled-section";
import { Campaign, Noun, Session } from "@prisma/client";
import { getRelationsForSession } from "~/queries/related.server";
import { RelatedThings, RelatedThing } from "~/components/related-things";
import { useCallback } from "react";
import {
  deleteSession,
  getSessionAndCampaign,
} from "~/queries/sessions.server";
import { requireUserId } from "~/session.server";
import { getParams } from "~/util";
import { getCampaignAccessLevel } from "~/queries/campaigns.server";
import Lock from "~/components/icons/lock";

export default function ViewSession() {
  const { accessLevel, session, campaign, relations } =
    useLoaderData<LoaderData>();
  const getNounUrl = useCallback(
    (t: RelatedThing) => `/campaigns/${campaign.id}/nouns/${t.id}`,
    [campaign.id]
  );
  const isAdmin = accessLevel === "ADMIN";

  return (
    <Content
      heading={
        <div className="flex items-center">
          {session.isSecret && <Lock className="mr-1" />}
          {session.name}
        </div>
      }
      breadcrumbs={[
        { text: "Campaigns", href: "/campaigns" },
        { text: campaign.name, href: `/campaigns/${campaign.id}` },
      ]}
      controls={
        isAdmin ? (
          <LinkButton
            to={`/campaigns/${campaign.id}/sessions/${session.id}/edit`}
            data-id="edit"
            title="Edit (Ctrl/Cmd-E)"
            shortcut="mod+e"
            style="darkPrimary"
          >
            Edit
          </LinkButton>
        ) : null
      }
      sidePanel={
        <SidePanel>
          <RelatedThings
            title="People"
            things={relations.people}
            getUrl={getNounUrl}
          />
          <RelatedThings
            title="Places"
            things={relations.places}
            getUrl={getNounUrl}
          />
          <RelatedThings
            title="Things"
            things={relations.things}
            getUrl={getNounUrl}
          />
          <RelatedThings
            title="Factions"
            things={relations.factions}
            getUrl={getNounUrl}
          />
        </SidePanel>
      }
    >
      <div className="flex space-x-6">
        <div className="flex-1 flex flex-col space-y-6">
          <TitledSection title="Summary">{session.summary}</TitledSection>
          <TitledSection title="Notes">
            <Markdown>{session.notes}</Markdown>
          </TitledSection>
          {isAdmin && (
            <PrivateTitledSection title="Private Notes">
              <Markdown>{session.privateNotes}</Markdown>
            </PrivateTitledSection>
          )}
        </div>
      </div>
    </Content>
  );
}

export const meta: MetaFunction = ({
  data,
}: {
  data: LoaderData | undefined;
}) => ({ title: data ? `${data.session.name} - ${data.campaign.name}` : "" });

type LoaderData = {
  accessLevel: string;
  session: Session;
  campaign: Campaign;
  relations: {
    people: Array<Noun>;
    places: Array<Noun>;
    things: Array<Noun>;
    factions: Array<Noun>;
  };
};
export let loader: LoaderFunction = async ({ request, params }) => {
  const { sessionId, campaignId } = getParams(params, [
    "sessionId",
    "campaignId",
  ] as const);
  const userId = await requireUserId(request);

  const [accessLevel, { session, campaign }, relations] = await Promise.all([
    getCampaignAccessLevel({ campaignId, userId }),
    getSessionAndCampaign({ sessionId, campaignId, userId }),
    getRelationsForSession({ sessionId, campaignId, userId }),
  ]);

  return { accessLevel, session, campaign, relations };
};

export let action: ActionFunction = async ({ request, params }) => {
  if (request.method === "DELETE") {
    const { sessionId, campaignId } = getParams(params, [
      "sessionId",
      "campaignId",
    ] as const);
    const userId = await requireUserId(request);

    deleteSession({ sessionId, campaignId, userId });

    return redirect(`/campaigns/${campaignId}`);
  }

  throw new Error("Non-DELETE methods not implemented");
};

import { Content, LinkButton, SidePanel } from "~/components/layout";
import { Markdown } from "~/components/markdown";
import {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
  redirect,
  useLoaderData,
} from "remix";
import { TitledSection } from "~/components/titled-section";
import { Campaign, Noun, Session } from "@prisma/client";
import { db } from "~/db.server";
import { getRelationsForSession } from "~/queries/related.server";
import { RelatedThings, RelatedThing } from "~/components/related-things";
import { useCallback } from "react";

export default function ViewSession() {
  const { session, campaign, relations } = useLoaderData<LoaderData>();
  const getNounUrl = useCallback(
    (t: RelatedThing) => `/campaigns/${campaign.id}/nouns/${t.id}`,
    [campaign.id]
  );

  return (
    <Content
      heading={session.name}
      breadcrumbs={[
        { text: "Campaigns", href: "/campaigns" },
        { text: campaign.name, href: `/campaigns/${campaign.id}` },
      ]}
      controls={
        <LinkButton
          to={`/campaigns/${campaign.id}/sessions/${session.id}/edit`}
          data-id="edit"
          title="Edit (Ctrl/Cmd-E)"
          shortcut="mod+e"
          style="darkPrimary"
        >
          Edit
        </LinkButton>
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
          <TitledSection title="Private Notes">
            <Markdown>{session.privateNotes}</Markdown>
          </TitledSection>
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
  session: Session;
  campaign: Campaign;
  relations: {
    people: Array<Noun>;
    places: Array<Noun>;
    things: Array<Noun>;
    factions: Array<Noun>;
  };
};
export let loader: LoaderFunction = async ({ params }) => {
  const { sessionId, campaignId } = params;
  if (!sessionId || !campaignId)
    throw new Error("nounId and campaignId required");

  const [session, campaign, relations] = await Promise.all([
    db.session.findUnique({ where: { id: sessionId } }),
    db.campaign.findUnique({ where: { id: campaignId } }),
    getRelationsForSession({ sessionId, campaignId }),
  ]);

  return { session, campaign, relations };
};

export let action: ActionFunction = async ({ request, params }) => {
  if (request.method === "DELETE") {
    const { sessionId, campaignId } = params;
    await db.session.delete({ where: { id: sessionId } });
    return redirect(`/campaigns/${campaignId}`);
  }

  throw new Error("Non-DELETE methods not implemented");
};

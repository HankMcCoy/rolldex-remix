import { useCallback } from "react";
import {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
  redirect,
  useLoaderData,
} from "remix";
import { Campaign, Noun, Session } from "@prisma/client";

import { LinkButton, Content, SidePanel } from "~/components/layout";
import { Markdown } from "~/components/markdown";
import {
  nounTypePluralDisplayText,
  nounTypeUrlFragment,
} from "~/util/noun-type-helpers";
import { RelatedThings, RelatedThing } from "~/components/related-things";
import {
  TitledSection,
  PrivateTitledSection,
} from "~/components/titled-section";

import { getRelationsForNoun } from "~/queries/related.server";
import { deleteNoun, getNounAndCampaign } from "~/queries/nouns.server";
import { requireUserId } from "~/session.server";
import { getParams } from "~/util";
import { getCampaignAccessLevel } from "~/queries/campaigns.server";

export default function ViewNoun() {
  const { noun, accessLevel, campaign, relations } =
    useLoaderData<LoaderData>();
  const getNounUrl = useCallback(
    (t: RelatedThing) => `/campaigns/${campaign.id}/nouns/${t.id}`,
    [campaign.id]
  );
  const isAdmin = accessLevel === "ADMIN";

  return (
    <Content
      heading={noun.name}
      breadcrumbs={[
        { text: "Campaigns", href: "/campaigns" },
        { text: campaign.name, href: `/campaigns/${campaign.id}` },
        {
          text: nounTypePluralDisplayText[noun.nounType],
          href: `/campaigns/${campaign.id}/nouns?nounType=${
            nounTypeUrlFragment[noun.nounType]
          }`,
        },
      ]}
      controls={
        isAdmin ? (
          <LinkButton
            to={`/campaigns/${campaign.id}/nouns/${noun.id}/edit`}
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
          <RelatedThings
            title="Sessions"
            things={relations.sessions}
            getUrl={(t) => `/campaigns/${campaign.id}/sessions/${t.id}`}
          />
        </SidePanel>
      }
    >
      <div className="flex space-x-6">
        <div className="flex flex-1 flex-col space-y-6">
          <TitledSection title="Summary">{noun.summary}</TitledSection>
          <TitledSection title="Notes">
            <Markdown>{noun.notes}</Markdown>
          </TitledSection>
          {isAdmin && (
            <PrivateTitledSection title="Private Notes">
              <Markdown>{noun.privateNotes || "--"}</Markdown>
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
}) => ({
  title: data ? `${data.noun.name} - ${data.campaign.name}` : "",
});

type LoaderData = {
  noun: Noun;
  campaign: Campaign;
  accessLevel: string;
  relations: {
    people: Array<Noun>;
    places: Array<Noun>;
    things: Array<Noun>;
    factions: Array<Noun>;
    sessions: Array<Session>;
  };
};
export let loader: LoaderFunction = async ({ params, request }) => {
  const { nounId, campaignId } = getParams(params, [
    "nounId",
    "campaignId",
  ] as const);
  const userId = await requireUserId(request);

  const [accessLevel, { noun, campaign }, relations] = await Promise.all([
    getCampaignAccessLevel({ campaignId, userId }),
    getNounAndCampaign({ nounId, campaignId, userId }),
    getRelationsForNoun({ nounId, campaignId }),
  ]);

  if (!noun || !campaign) throw new Response("Not found", { status: 404 });

  return {
    noun,
    campaign,
    accessLevel,
    relations,
  };
};

export let action: ActionFunction = async ({ request, params }) => {
  if (request.method === "DELETE") {
    const userId = await requireUserId(request);

    const { nounId, campaignId } = getParams(params, [
      "nounId",
      "campaignId",
    ] as const);

    await deleteNoun({ nounId, campaignId, userId });
    return redirect(`/campaigns/${campaignId}`);
  }

  throw new Error("Non-DELETE methods not implemented");
};

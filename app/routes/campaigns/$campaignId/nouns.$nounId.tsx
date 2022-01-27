import { LinkButton, Content } from "~/components/layout";
import { Markdown } from "~/components/markdown";
import { nounTypePluralDisplayText, nounTypeUrlFragment } from "~/fake-data";
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
import { getRelations } from "~/queries/related.server";

export default function ViewNoun() {
  const { noun, campaign, relations } = useLoaderData<LoaderData>();

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
        <LinkButton
          to={`/campaigns/${campaign.id}/nouns/${noun.id}/edit`}
          data-id="edit"
          title="Edit (Ctrl/Cmd-E)"
          shortcut="mod+e"
          style="darkPrimary"
        >
          Edit
        </LinkButton>
      }
      sidePanel={
        <div className="flex-initial w-64 bg-violet-50">
          <h2>People</h2>
          <ul>
            {relations.people.map((n) => (
              <li>{n.name}</li>
            ))}
          </ul>
          <h2>Sessions</h2>
          <ul>
            {relations.sessions.map((s) => (
              <li>{s.name}</li>
            ))}
          </ul>
        </div>
      }
    >
      <div className="flex space-x-6">
        <div className="flex-1 flex flex-col space-y-6">
          <TitledSection title="Summary">{noun.summary}</TitledSection>
          <TitledSection title="Notes">
            <Markdown>{noun.notes}</Markdown>
          </TitledSection>
          <TitledSection title="Private Notes">
            <Markdown>{noun.privateNotes}</Markdown>
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
}) => ({
  title: data ? `${data.noun.name} - ${data.campaign.name}` : "",
});

type LoaderData = {
  noun: Noun;
  campaign: Campaign;
  relations: {
    people: Array<Noun>;
    places: Array<Noun>;
    things: Array<Noun>;
    factions: Array<Noun>;
    sessions: Array<Session>;
  };
};
export let loader: LoaderFunction = async ({ params }) => {
  const { nounId, campaignId } = params;
  if (!nounId || !campaignId) throw new Error("nounId and campaignId required");

  const [noun, campaign, relations] = await Promise.all([
    db.noun.findUnique({ where: { id: nounId } }),
    db.campaign.findUnique({ where: { id: campaignId } }),
    getRelations({ nounId, campaignId }),
  ]);

  if (!noun) throw new Response("Noun not found", { status: 404 });

  return {
    noun,
    campaign,
    relations: {
      sessions: relations.sessions,
      people: relations.nouns.filter((n) => n.nounType === "PERSON"),
      places: relations.nouns.filter((n) => n.nounType === "PLACE"),
      things: relations.nouns.filter((n) => n.nounType === "THING"),
      factions: relations.nouns.filter((n) => n.nounType === "FACTIOn"),
    },
  };
};

export let action: ActionFunction = async ({ request, params }) => {
  if (request.method === "DELETE") {
    const { nounId, campaignId } = params;
    await db.noun.delete({ where: { id: nounId } });
    return redirect(`/campaigns/${campaignId}`);
  }

  throw new Error("Non-DELETE methods not implemented");
};

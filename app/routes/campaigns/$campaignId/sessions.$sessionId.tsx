import { Content, LinkButton } from "~/components/layout";
import { Markdown } from "~/components/markdown";
import { LoaderFunction, MetaFunction, useLoaderData } from "remix";
import { TitledSection } from "~/components/titled-section";
import { db } from "~/db.server";
import { Campaign, Session } from "@prisma/client";

export default function ViewSession() {
  const { session, campaign } = useLoaderData<LoaderData>();

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
};
export let loader: LoaderFunction = async ({ params }) => {
  const { sessionId, campaignId } = params;
  if (!sessionId || !campaignId)
    throw new Error("nounId and campaignId required");

  const [session, campaign] = await Promise.all([
    db.session.findUnique({ where: { id: sessionId } }),
    db.campaign.findUnique({ where: { id: campaignId } }),
  ]);

  return { session, campaign };
};

import { Content } from "~/components/layout";
import { Markdown } from "~/components/markdown";
import { campaignsById, Session, Campaign, sessionsById } from "~/fake-data";
import { LoaderFunction, useLoaderData } from "remix";
import { TitledSection } from "~/components/titled-section";

type LoaderData = {
  session: Session;
  campaign: Campaign;
};
export let loader: LoaderFunction = ({ params }) => {
  const { sessionId, campaignId } = params;
  if (!sessionId || !campaignId)
    throw new Error("nounId and campaignId required");
  const session = sessionsById[sessionId];
  const campaign = campaignsById[campaignId];
  return { session, campaign };
};

interface Props {
  params: {
    campaignId: string;
  };
}
export default function ViewSession({ params }: Props) {
  const { session, campaign } = useLoaderData<LoaderData>();

  return (
    <Content
      heading={session.name}
      breadcrumbs={[
        { text: "Campaigns", href: "/campaigns" },
        { text: campaign.name, href: `/campaigns/${campaign.id}` },
      ]}
    >
      <div className="flex space-x-6">
        <div className="flex-1 flex flex-col space-y-6">
          <TitledSection title="Summary">{session.summary}</TitledSection>
          <TitledSection title="Notes">
            <Markdown>{session.notes}</Markdown>
          </TitledSection>
          <TitledSection title="Private Notes">
            <Markdown>{session.private_notes}</Markdown>
          </TitledSection>
        </div>
      </div>
    </Content>
  );
}

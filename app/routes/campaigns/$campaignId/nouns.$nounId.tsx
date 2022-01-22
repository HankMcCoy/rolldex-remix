import { LinkButton, Content } from "~/components/layout";
import { Markdown } from "~/components/markdown";
import { nounTypePluralDisplayText, nounTypeUrlFragment } from "~/fake-data";
import { LoaderFunction, useLoaderData } from "remix";
import { TitledSection } from "~/components/titled-section";
import { Campaign, Noun } from "@prisma/client";
import { db } from "~/db.server";

type LoaderData = {
  noun: Noun;
  campaign: Campaign;
};
export let loader: LoaderFunction = async ({ params }) => {
  const { nounId, campaignId } = params;
  if (!nounId || !campaignId) throw new Error("nounId and campaignId required");

  const [noun, campaign] = await Promise.all([
    db.noun.findUnique({ where: { id: nounId } }),
    db.campaign.findUnique({ where: { id: campaignId } }),
  ]);

  return { noun, campaign };
};

interface Props {
  params: {
    campaignId: string;
  };
}
export default function ViewNoun({ params }: Props) {
  const { noun, campaign } = useLoaderData<LoaderData>();

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
          type="primary"
        >
          Edit
        </LinkButton>
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

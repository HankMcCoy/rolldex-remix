import { Campaign } from ".prisma/client";
import { useLoaderData } from "remix";
import { Content, LinkButton } from "~/components/layout";
import { LinkBox } from "~/components/link-box";
import { db } from "~/db.server";

interface LoaderData {
  campaigns: Array<Campaign>;
}
export let loader = async () => {
  const campaigns = await db.campaign.findMany({});
  return { campaigns };
};

export default function CampaignsList() {
  const { campaigns } = useLoaderData<LoaderData>();
  return (
    <>
      <Content
        heading="Campaigns"
        controls={
          <LinkButton
            to="/campaigns/add"
            title="Add a new campaign"
            style="darkSecondary"
          >
            Add
          </LinkButton>
        }
      >
        {campaigns.map((c) => (
          <LinkBox
            key={c.id}
            title={c.name}
            desc={c.summary}
            href={`/campaigns/${c.id}`}
          />
        ))}
      </Content>
    </>
  );
}

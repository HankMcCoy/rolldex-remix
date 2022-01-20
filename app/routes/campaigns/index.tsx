import { Campaign } from ".prisma/client";
import { Link, useLoaderData } from "remix";
import { Content } from "~/components/layout";
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
        controls={<Link to="/campaigns/add">Add</Link>}
      >
        {campaigns.map((c) => (
          <LinkBox
            title={c.name}
            desc={c.summary}
            href={`/campaigns/${c.id}`}
          />
        ))}
      </Content>
    </>
  );
}

import { Campaign } from ".prisma/client";
import { useLoaderData, LoaderFunction } from "remix";
import { Content, LinkButton } from "~/components/layout";
import { LinkBox } from "~/components/link-box";
import { db } from "~/db.server";
import { getCampaignList } from "~/queries/campaigns.server";
import { requireUserId } from "~/session.server";
interface LoaderData {
  campaigns: Array<Campaign>;
}
export let loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const campaigns = await getCampaignList({ userId });
  return { campaigns };
};

export const meta = () => ({ title: "Campaigns" });

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

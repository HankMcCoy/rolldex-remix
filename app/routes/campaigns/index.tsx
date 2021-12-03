import { useLoaderData } from "remix";
import { Content } from "~/components/layout";
import { LinkBox } from "~/components/link-box";
import { Campaign, campaigns } from "~/fake-data";

export let loader = () => {
  return campaigns;
};

export default function CampaignsList() {
  const campaigns = useLoaderData<Campaign[]>();
  return (
    <>
      <Content heading="Campaigns">
        {campaigns.map((c) => (
          <LinkBox
            title={c.name}
            desc={c.description}
            href={`/campaigns/${c.id}`}
          />
        ))}
      </Content>
    </>
  );
}

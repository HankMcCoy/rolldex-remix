import { Content } from "~/components/layout";
import {
  nounTypePluralDisplayText,
  getNounTypeFromUrlFragment,
  nounTypeUrlFragment,
} from "~/fake-data";
import { Link, LoaderFunction, MetaFunction, useLoaderData } from "remix";
import { LinkBox } from "~/components/link-box";
import { Campaign, Noun } from "@prisma/client";
import { db } from "~/db.server";

export default function NounsList() {
  const { nounType, nounsOfType, campaign } = useLoaderData<LoaderData>();

  return (
    <Content
      heading={nounTypePluralDisplayText[nounType]}
      breadcrumbs={[
        { text: "Campaigns", href: "/campaigns" },
        { text: campaign.name, href: `/campaigns/${campaign.id}` },
      ]}
      controls={
        <Link
          to={`/campaigns/${campaign.id}/nouns/add?nounType=${nounTypeUrlFragment[nounType]}`}
        >
          Add
        </Link>
      }
    >
      <div className="flex space-x-6">
        <div className="flex flex-col space-y-2 w-full">
          {nounsOfType.map((n) => (
            <LinkBox
              key={n.id}
              title={n.name}
              desc={n.summary}
              href={`/campaigns/${campaign.id}/nouns/${n.id}`}
            />
          ))}
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
  title: data
    ? `${nounTypePluralDisplayText[data.nounType]} - ${data.campaign.name}`
    : "",
});

type LoaderData = {
  nounType: string;
  nounsOfType: Array<Noun>;
  campaign: Campaign;
};
export const loader: LoaderFunction = async ({ request, params }) => {
  const { campaignId } = params;
  const nounType = getNounTypeFromUrlFragment(
    new URL(request.url).searchParams.get("nounType")
  );
  if (!nounType || !campaignId)
    throw new Error(
      `nounType and campaignId required, ${JSON.stringify({
        nounType,
        campaignId,
      })}`
    );
  const campaign = await db.campaign.findUnique({ where: { id: campaignId } });
  const nounsOfType = await db.noun.findMany({
    where: { nounType },
    orderBy: { name: "asc" },
  });
  return { nounType, nounsOfType, campaign };
};

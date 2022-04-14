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
import { getCampaign } from "~/queries/campaigns.server";
import { getParams, getQueryParams } from "~/util";
import { requireUserId } from "~/session.server";
import { getNounsForCampaign } from "~/queries/nouns.server";

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
  const userId = await requireUserId(request);
  const { campaignId } = getParams(params, ["campaignId"] as const);
  const nounType = getNounTypeFromUrlFragment(
    getQueryParams(request, ["nounType"] as const).nounType
  );

  if (!nounType) throw new Error("Invalid nounType");

  const [campaign, nounsOfType] = await Promise.all([
    getCampaign({ campaignId, userId }),
    getNounsForCampaign({
      campaignId,
      userId,
      where: { nounType },
      orderBy: { name: "asc" },
    }),
  ]);

  return { nounType, nounsOfType, campaign };
};

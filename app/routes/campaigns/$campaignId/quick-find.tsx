import { json, LoaderFunction } from "remix";
import { getNounsForCampaign } from "~/queries/nouns.server";
import { getSessionsForCampaign } from "~/queries/sessions.server";
import { requireUserId } from "~/session.server";
import { getParams, getQueryParams } from "~/util";

type Match = {
  name: string;
  href: string;
};
export let loader: LoaderFunction = async ({ params, request }) => {
  const userId = await requireUserId(request);
  const { campaignId } = getParams(params, ["campaignId"] as const);
  const { q } = getQueryParams(request, ["q"] as const);
  if (q === "")
    return json({ err_code: "MISSING QUERY PARAM" }, { status: 400 });

  const [nouns, sessions] = await Promise.all([
    getNounsForCampaign({
      campaignId,
      userId,
      where: { name: { contains: q } },
      take: 5,
    }),
    getSessionsForCampaign({
      campaignId,
      userId,
      where: { name: { contains: q } },
      take: 5,
    }),
  ]);

  const matches: Array<Match> = [
    ...nouns.map((n) => ({
      name: n.name,
      href: `/campaigns/${campaignId}/nouns/${n.id}`,
    })),
    ...sessions.map((s) => ({
      name: s.name,
      href: `/campaigns/${campaignId}/sessions/${s.id}`,
    })),
  ];
  return json({ matches });
};

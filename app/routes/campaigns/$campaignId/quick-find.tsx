import { json, LoaderFunction } from "remix";
import { db } from "~/db.server";

type Match = {
  name: string;
  href: string;
};
export let loader: LoaderFunction = async ({ params, request }) => {
  const { campaignId } = params;
  const search = new URL(request.url).searchParams.get("q");
  if (search === null || search === "")
    return json({ err_code: "MISSING QUERY PARAM" }, { status: 400 });

  const nouns = await db.noun.findMany({
    where: { campaignId, name: { contains: search } },
    take: 5,
  });
  const sessions = await db.session.findMany({
    where: { campaignId, name: { contains: search } },
    take: 5,
  });
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

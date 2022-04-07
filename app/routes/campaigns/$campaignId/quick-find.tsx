import { json, LoaderFunction } from "remix";
import { db } from "~/db.server";

export let loader: LoaderFunction = async ({ params, request }) => {
  const { campaignId } = params;
  const search = new URL(request.url).searchParams.get("q");
  if (search === null || search === "")
    return json({ err_code: "MISSING QUERY PARAM" }, { status: 400 });

  const nouns = await db.noun.findMany({
    where: { campaignId, name: { contains: search } },
    take: 5,
  });
  return json({ nouns });
};

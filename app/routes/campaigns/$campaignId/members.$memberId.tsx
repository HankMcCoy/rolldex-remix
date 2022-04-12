import { ActionFunction, redirect } from "remix";
import { db } from "~/db.server";

export let action: ActionFunction = async ({ request, params }) => {
  if (request.method === "DELETE") {
    const { memberId, campaignId } = params;
    await db.member.delete({ where: { id: memberId } });
    return redirect(`/campaigns/${campaignId}`);
  }

  throw new Error("Non-DELETE methods not implemented");
};

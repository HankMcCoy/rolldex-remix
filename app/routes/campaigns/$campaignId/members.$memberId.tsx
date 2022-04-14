import { ActionFunction, redirect } from "remix";
import { deleteMember } from "~/queries/members.server";
import { requireUserId } from "~/session.server";
import { getParams } from "~/util";

export let action: ActionFunction = async ({ request, params }) => {
  if (request.method === "DELETE") {
    const { memberId, campaignId } = getParams(params, [
      "memberId",
      "campaignId",
    ] as const);
    const userId = await requireUserId(request);

    await deleteMember({ campaignId, memberId, userId });

    return redirect(`/campaigns/${campaignId}`);
  }

  throw new Error("Non-DELETE methods not implemented");
};

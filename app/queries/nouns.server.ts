import { Campaign, Noun } from "@prisma/client";
import { db } from "~/db.server";
import { getCampaign } from "./campaigns.server";

function enforceMemberVisibility(noun: Noun): Noun {
  return {
    ...noun,
    privateNotes: "",
  };
}
export async function getNounAndCampaign({
  nounId,
  campaignId,
  userId,
}: {
  nounId: string;
  campaignId: string;
  userId: string;
}): Promise<{ noun: Noun | null; campaign: Campaign | null }> {
  const [noun, campaign] = await Promise.all([
    db.noun.findUnique({ where: { id: nounId } }),
    getCampaign({ campaignId, userId }),
  ]);

  // TODO: Make errors better
  if (!noun || !campaign) return { noun: null, campaign: null };
  if (noun.campaignId !== campaign.id)
    throw new Error("Noun's campaign does not match provided campaign");

  return { noun: enforceMemberVisibility(noun), campaign };
}

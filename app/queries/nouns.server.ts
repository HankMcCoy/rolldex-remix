import { Campaign, Noun } from "@prisma/client";
import { db } from "~/db.server";
import { enforceWriteAccess, getCampaign } from "./campaigns.server";

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

export async function deleteNoun({
  nounId,
  campaignId,
  userId,
}: {
  nounId: string;
  campaignId: string;
  userId: string;
}): Promise<void> {
  enforceWriteAccess({ campaignId, userId });
  await db.noun.delete({ where: { id: nounId } });
}

export async function createNoun({
  userId,
  fields,
}: {
  userId: string;
  fields: { [k: string]: string };
}): Promise<Noun> {
  enforceWriteAccess({ campaignId: fields.campaignId, userId });
  const noun = await db.noun.create({
    data: {
      campaignId: fields.campaignId,
      name: fields.name,
      summary: fields.summary,
      nounType: fields.nounType,
      notes: fields.notes,
      privateNotes: fields.privateNotes,
    },
  });
  return noun;
}

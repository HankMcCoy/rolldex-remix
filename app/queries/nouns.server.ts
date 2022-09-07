import { Campaign, Noun, Prisma } from "@prisma/client";
import { db } from "~/db.server";
import {
  enforceWriteAccess,
  getCampaign,
  getCampaignAccessLevel,
} from "./campaigns.server";

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

  return {
    noun:
      userId === campaign.createdById ? noun : enforceMemberVisibility(noun),
    campaign,
  };
}

export async function getNounsForCampaign({
  campaignId,
  userId,
  where,
  orderBy,
  take,
}: {
  campaignId: string;
  userId: string;
  where?: Prisma.NounWhereInput;
  orderBy?: Prisma.Enumerable<Prisma.NounOrderByWithRelationInput>;
  take?: number;
}): Promise<Noun[]> {
  const accessLevel = await getCampaignAccessLevel({ campaignId, userId });
  if (accessLevel === "NONE")
    throw new Error("User does not have access to campaign");

  const nouns = await db.noun.findMany({
    where: { ...where, campaignId },
    orderBy,
    take,
  });

  // Clear out any private fields
  if (accessLevel === "READ_ONLY") {
    nouns.forEach((n) => {
      n.privateNotes === "";
    });
  }

  return nouns;
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
  await enforceWriteAccess({ campaignId, userId });
  await db.noun.delete({ where: { id: nounId } });
}

export async function createNoun({
  userId,
  data,
}: {
  userId: string;
  data: {
    campaignId: string;
    name: string;
    summary: string;
    notes: string;
    privateNotes: string;
    nounType: string;
    isSecret: boolean;
  };
}): Promise<Noun> {
  await enforceWriteAccess({ campaignId: data.campaignId, userId });
  const noun = await db.noun.create({
    data,
  });
  return noun;
}

export async function updateNoun({
  userId,
  campaignId,
  nounId,
  data: { name, summary, notes, privateNotes, nounType, isSecret },
}: {
  userId: string;
  campaignId: string;
  nounId: string;
  data: {
    name: string;
    summary: string;
    notes: string;
    privateNotes: string;
    nounType: string;
    isSecret: boolean;
  };
}): Promise<Noun> {
  await enforceWriteAccess({ campaignId, userId });

  return await db.noun.update({
    where: { id: nounId },
    data: { name, summary, notes, privateNotes, nounType, isSecret },
  });
}

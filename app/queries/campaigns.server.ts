import { Campaign, Prisma, User } from "@prisma/client";
import { db } from "~/db.server";

export async function getCampaign({
  campaignId,
  userId,
}: {
  campaignId: string;
  userId: string;
}): Promise<Campaign | null> {
  const campaign = await db.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) return null;

  if (campaign.createdById === userId) return campaign;

  const isMember = checkUserIdIsMember({ campaignId, userId });
  if (!isMember) throw new Error("Cannot access campaign");

  return campaign;
}

export type CampaignAccessLevel = "ADMIN" | "READ_ONLY" | "NONE";
export async function getCampaignAccessLevel({
  campaignId,
  userId,
}: {
  campaignId: string;
  userId: string;
}): Promise<CampaignAccessLevel> {
  if (await checkUserIdIsAdmin({ campaignId, userId })) return "ADMIN";
  if (await checkUserIdIsMember({ campaignId, userId })) return "READ_ONLY";
  return "NONE";
}

export async function checkHasAccess({
  campaignId,
  userId,
}: {
  campaignId: string;
  userId: string;
}): Promise<boolean> {
  const isAdmin = await checkUserIdIsAdmin({ campaignId, userId });

  if (isAdmin) return true;

  return await checkUserIdIsMember({ campaignId, userId });
}

export async function checkUserIdIsAdmin({
  campaignId,
  userId,
}: {
  campaignId: string;
  userId: string;
}) {
  const campaign = await db.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) return false;
  return campaign.createdById === userId;
}

export async function checkUserIdIsMember({
  campaignId,
  userId,
}: {
  campaignId: string;
  userId: string;
}) {
  const user = await db.user.findUnique({ where: { id: userId } });
  return await checkUserIsMember({ campaignId, user });
}

export async function checkUserIsMember({
  campaignId,
  user,
}: {
  campaignId: string;
  user: User | null;
}): Promise<boolean> {
  if (!user) throw new Error("User not found");

  const member = await db.member.findUnique({
    where: {
      campaignId_email: { campaignId, email: user.email },
    },
  });
  return member !== null;
}

export async function getCampaignList({
  userId,
}: {
  userId: string;
}): Promise<Array<Campaign>> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const campaignsUserCreated = await db.campaign.findMany({
    where: { createdById: userId },
  });
  const campaignsUserIsMemberOf = await db.member.findMany({
    where: { email: user.email },
    select: {
      campaign: true,
    },
  });

  return campaignsUserCreated.concat(
    campaignsUserIsMemberOf.map((x) => x.campaign)
  );
}

export async function createCampaign({
  userId,
  data,
}: {
  userId: string;
  data: {
    name: string;
    summary: string;
  };
}): Promise<Campaign> {
  return await db.campaign.create({
    data: {
      ...data,
      createdById: userId,
    },
  });
}

export async function updateCampaign({
  campaignId,
  userId,
  data,
}: {
  campaignId: string;
  userId: string;
  data: Prisma.CampaignUncheckedUpdateInput;
}) {
  await enforceWriteAccess({ campaignId, userId });
  await db.campaign.update({
    where: { id: campaignId },
    data,
  });
}

export async function enforceWriteAccess({
  campaignId,
  userId,
}: {
  campaignId: string;
  userId: string;
}): Promise<void> {
  const accessLevel = await getCampaignAccessLevel({ campaignId, userId });
  if (accessLevel !== "ADMIN")
    throw new Error("User does not have write access to this campaign");
}

export async function enforceReadAccess({
  campaignId,
  userId,
}: {
  campaignId: string;
  userId: string;
}): Promise<void> {
  const accessLevel = await getCampaignAccessLevel({ campaignId, userId });
  if (accessLevel !== "ADMIN" && accessLevel !== "READ_ONLY")
    throw new Error("User does not have read access to this campaign");
}

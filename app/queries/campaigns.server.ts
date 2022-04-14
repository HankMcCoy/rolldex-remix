import { Campaign, Prisma } from "@prisma/client";
import { db } from "~/db.server";

export async function getCampaign({
  campaignId,
  userId,
}: {
  campaignId: string;
  userId: string;
}): Promise<Campaign | null> {
  const [campaign, user] = await Promise.all([
    db.campaign.findUnique({ where: { id: campaignId } }),
    db.user.findUnique({ where: { id: userId } }),
  ]);
  if (!campaign || !user) return null;
  if (campaign.createdById === userId) return campaign;

  const member = await db.member.findUnique({
    where: {
      campaignId_email: { campaignId, email: user.email },
    },
  });

  if (!member) throw new Error("Cannot access campaign");
  return campaign;
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
  const [campaign, user] = await Promise.all([
    db.campaign.findUnique({ where: { id: campaignId } }),
    db.user.findUnique({ where: { id: userId } }),
  ]);

  if (!campaign || !user) throw new Error("User/campaign not found");
  if (campaign.createdById !== userId)
    throw new Error("User does not have write access to this campaign");
}

import { db } from "~/db.server";
import { enforceWriteAccess } from "./campaigns.server";

export async function createMember({
  campaignId,
  userId,
  email,
}: {
  campaignId: string;
  userId: string;
  email: string;
}) {
  await enforceWriteAccess({ campaignId, userId });
  await db.member.create({
    data: { campaignId, email, memberType: "READ_ONLY" },
  });
}

export async function deleteMember({
  campaignId,
  userId,
  memberId,
}: {
  campaignId: string;
  userId: string;
  memberId: string;
}) {
  const member = await db.member.findUnique({ where: { id: memberId } });
  // If the member doesn't exist, yay! Already deleted!
  if (!member) return;
  if (member.campaignId !== campaignId)
    throw new Error("Member is not connected to campaign");

  await enforceWriteAccess({ campaignId, userId });
  await db.member.delete({ where: { id: memberId } });
}

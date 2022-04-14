import { Campaign, Session, Prisma } from "@prisma/client";
import { db } from "~/db.server";
import {
  enforceReadAccess,
  enforceWriteAccess,
  getCampaignAccessLevel,
  getCampaign,
} from "./campaigns.server";

function enforceMemberVisibility(session: Session): Session {
  return {
    ...session,
    privateNotes: "",
  };
}

export async function getSessionsForCampaign({
  campaignId,
  userId,
  where,
  orderBy,
  take,
}: {
  campaignId: string;
  userId: string;
  where?: Prisma.SessionWhereInput;
  orderBy?: Prisma.Enumerable<Prisma.SessionOrderByWithRelationInput>;
  take?: number;
}): Promise<Session[]> {
  const accessLevel = await getCampaignAccessLevel({ campaignId, userId });
  if (accessLevel === "NONE") throw new Error("Not authorized to access");

  const sessions = await db.session.findMany({
    where: { ...where, campaignId },
    orderBy: { createdAt: "desc", ...orderBy },
    take,
  });

  if (accessLevel === "READ_ONLY") {
    sessions.forEach((s) => {
      s.privateNotes === "";
    });
  }

  return sessions;
}

export async function getSessionAndCampaign({
  sessionId,
  campaignId,
  userId,
}: {
  sessionId: string;
  campaignId: string;
  userId: string;
}): Promise<{ session: Session | null; campaign: Campaign | null }> {
  const [session, campaign] = await Promise.all([
    db.session.findUnique({ where: { id: sessionId } }),
    getCampaign({ campaignId, userId }),
  ]);

  // TODO: Make errors better
  if (!session || !campaign) return { session: null, campaign: null };
  if (session.campaignId !== campaign.id)
    throw new Error("Session's campaign does not match provided campaign");

  return {
    session:
      userId === campaign.createdById
        ? session
        : enforceMemberVisibility(session),
    campaign,
  };
}

export async function deleteSession({
  sessionId,
  campaignId,
  userId,
}: {
  sessionId: string;
  campaignId: string;
  userId: string;
}): Promise<void> {
  await enforceWriteAccess({ campaignId, userId });
  await db.session.delete({ where: { id: sessionId } });
}

export async function createSession({
  userId,
  fields,
}: {
  userId: string;
  fields: { [k: string]: string };
}): Promise<Session> {
  await enforceWriteAccess({ campaignId: fields.campaignId, userId });
  const session = await db.session.create({
    data: {
      campaignId: fields.campaignId,
      name: fields.name,
      summary: fields.summary,
      notes: fields.notes,
      privateNotes: fields.privateNotes,
    },
  });
  return session;
}

export async function updateSession({
  userId,
  campaignId,
  sessionId,
  data: { name, summary, notes, privateNotes },
}: {
  userId: string;
  campaignId: string;
  sessionId: string;
  data: {
    name: string;
    summary: string;
    notes: string;
    privateNotes: string;
  };
}): Promise<Session> {
  await enforceWriteAccess({ campaignId, userId });

  return await db.session.update({
    where: { id: sessionId },
    data: { name, summary, notes, privateNotes },
  });
}

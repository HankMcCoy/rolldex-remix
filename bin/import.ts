import { PrismaClient } from "@prisma/client";
import csv from "csv-parser";
import fs from "fs";
import path from "path";

const parseCsv = <T>(filePath: string): Promise<Array<T>> => {
  const results: Array<T> = [];

  return new Promise((resolve) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        resolve(results);
      });
  });
};

const getPath = (fileName: string) =>
  path.join(__dirname, `../.import/${fileName}`);

interface OldUser {
  id: number;
  inserted_at: string;

  email: string;
  password: string;
}

interface OldCampaign {
  id: number;
  inserted_at: string;
  updated_at: string;

  name: string;
  description: string;
  created_by_id: number;
}
interface OldCampaignMember {
  id: number;
  inserted_at: string;
  updated_at: string;

  user_id: number;
  campaign_id: number;
}
interface OldNoun {
  id: number;
  inserted_at: string;
  updated_at: string;

  name: string;
  summary: string;
  noun_type: string;
  campaign_id: number;
  notes: string;
  private_notes: string;
}
interface OldSession {
  id: number;
  inserted_at: string;
  updated_at: string;

  name: string;
  summary: string;
  campaign_id: number;
  notes: string;
  private_notes: string;
}

let db: PrismaClient = new PrismaClient();
db.$connect().then(async () => {
  // Load up all the data
  const users = await parseCsv<OldUser>(getPath("users.csv"));
  const campaigns = await parseCsv<OldCampaign>(getPath("campaigns.csv"));
  const campaignMembers = await parseCsv<OldCampaignMember>(
    getPath("campaign_members.csv")
  );
  const nouns = await parseCsv<OldNoun>(getPath("nouns.csv"));
  const sessions = await parseCsv<OldSession>(getPath("sessions.csv"));

  console.log("USER", users[0]);
  console.log("CAMPAIGN", campaigns[0]);
  console.log("CAMPAIGN MEMBER", campaignMembers[0]);
  console.log("NOUN", nouns[0]);
  console.log("SESSION", sessions[0]);

  // Import users
  const userIdMapping: { [oldId: number]: string } = {};
  for (let u of users) {
    const newUser = await db.user.create({
      data: {
        createdAt: new Date(u.inserted_at),

        email: u.email,
        passwordHash: u.password,
      },
    });
    userIdMapping[u.id] = newUser.id;
  }

  // Import campaigns
  const campaignIdMapping: { [oldId: number]: string } = {};
  for (let c of campaigns) {
    const newCampaign = await db.campaign.create({
      data: {
        createdAt: new Date(c.inserted_at),
        updatedAt: new Date(c.updated_at),

        createdById: userIdMapping[c.created_by_id],
        name: c.name,
        summary: c.description,
      },
    });
    campaignIdMapping[c.id] = newCampaign.id;
  }

  // Import campaign members
  for (let m of campaignMembers) {
    const user = await db.user.findUnique({
      where: { id: userIdMapping[m.user_id] },
    });
    if (!user) throw new Error(`Failed to find user with id: ${m.user_id}`);

    await db.member.create({
      data: {
        createdAt: new Date(m.inserted_at),
        updatedAt: new Date(m.updated_at),

        email: user.email,
        campaignId: campaignIdMapping[m.campaign_id],
        memberType: "READ_ONLY",
      },
    });
  }

  // Import sessions
  for (let s of sessions) {
    await db.session.create({
      data: {
        createdAt: new Date(s.inserted_at),
        updatedAt: new Date(s.updated_at),

        name: s.name,
        notes: s.notes,
        privateNotes: s.private_notes,
        summary: s.summary,
        campaignId: campaignIdMapping[s.campaign_id],
      },
    });
  }

  // Import nouns
  for (let n of nouns) {
    await db.noun.create({
      data: {
        createdAt: new Date(n.inserted_at),
        updatedAt: new Date(n.updated_at),

        name: n.name,
        notes: n.notes,
        privateNotes: n.private_notes,
        summary: n.summary,
        nounType: n.noun_type,
        campaignId: campaignIdMapping[n.campaign_id],
      },
    });
  }

  console.log("DONE!");
});

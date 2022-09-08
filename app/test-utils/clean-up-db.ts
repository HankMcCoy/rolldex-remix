import { db } from "~/db.server";

export async function cleanUpDb() {
  await Promise.all([
    db.member.deleteMany(),
    db.noun.deleteMany(),
    db.session.deleteMany(),
  ]);
  await db.campaign.deleteMany();
  await db.user.deleteMany();
}

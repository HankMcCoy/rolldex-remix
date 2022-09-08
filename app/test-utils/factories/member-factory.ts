import { db } from "~/db.server";
import { createUser } from "./user-factory";

interface Overrides {
  email?: string;
}

interface Args {
  campaignId: string;
  overrides?: Overrides;
}
export async function createMember({ campaignId, overrides }: Args) {
  let email = overrides?.email;
  if (!email) {
    const user = await createUser();
    email = user.email;
  }
  return db.member.create({
    data: {
      email,
      campaignId,
      memberType: "READ_ONLY",
    },
  });
}

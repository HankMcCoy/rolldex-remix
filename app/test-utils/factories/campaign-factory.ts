import { db } from "~/db.server";
import { randText, randParagraph } from "@ngneat/falso";
import { createUser } from "./user-factory";
import { createMember } from "./member-factory";

interface Overrides {
  userId?: string;
  name?: string;
  summary?: string;
}

interface Args {
  overrides?: Overrides;
}
export async function createCampaign({ overrides }: Args = {}) {
  let userId = overrides?.userId;
  if (!userId) {
    const user = await createUser();
    userId = user.id;
  }
  return db.campaign.create({
    data: {
      createdById: userId,
      name: overrides?.name ?? randText(),
      summary: overrides?.summary ?? randParagraph(),
    },
  });
}

export async function createCampaignWithMember(args: Args = {}) {
  const readOnlyUser = await createUser();
  const campaign = await createCampaign(args);
  await createMember({
    campaignId: campaign.id,
    overrides: { email: readOnlyUser.email },
  });

  return { readOnlyUser, campaign };
}

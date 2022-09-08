import { describe, expect, test } from "@jest/globals";
import { createCampaign } from "~/test-utils/factories/campaign-factory";
import { createMember } from "~/test-utils/factories/member-factory";
import { createNoun } from "~/test-utils/factories/noun-factory";
import { createUser } from "~/test-utils/factories/user-factory";
import { getNounAndCampaign } from "./nouns.server";

describe("getNounAndCampaign", () => {
  test("returns matching noun and campaign for admin", async () => {
    const campaign = await createCampaign();
    const noun = await createNoun({
      campaignId: campaign.id,
      overrides: {
        name: "Jo Brand",
        summary: "A brilliant comic",
        notes: "Full name: Josephine Grace Brand",
        privateNotes: "Alma mater: Brunel University",
      },
    });

    const result = await getNounAndCampaign({
      nounId: noun.id,
      campaignId: campaign.id,
      userId: campaign.createdById,
    });

    expect(result.noun?.id).toBe(noun.id);
    expect(result.noun?.name).toBe("Jo Brand");
    expect(result.noun?.summary).toBe("A brilliant comic");
    expect(result.noun?.notes).toBe("Full name: Josephine Grace Brand");
    expect(result.noun?.privateNotes).toBe("Alma mater: Brunel University");
    expect(result.campaign?.id).toBe(campaign.id);
  });

  test("returns matching noun and campaign for read only member, minus private notes", async () => {
    const readOnlyUser = await createUser();
    const campaign = await createCampaign();
    await createMember({
      campaignId: campaign.id,
      overrides: { email: readOnlyUser.email },
    });
    const noun = await createNoun({
      campaignId: campaign.id,
      overrides: {
        name: "Jo Brand",
        summary: "A brilliant comic",
        notes: "Full name: Josephine Grace Brand",
        privateNotes: "Alma mater: Brunel University",
      },
    });

    const result = await getNounAndCampaign({
      nounId: noun.id,
      campaignId: campaign.id,
      userId: readOnlyUser.id,
    });

    expect(result.noun?.id).toBe(noun.id);
    expect(result.noun?.name).toBe("Jo Brand");
    expect(result.noun?.summary).toBe("A brilliant comic");
    expect(result.noun?.notes).toBe("Full name: Josephine Grace Brand");
    expect(result.noun?.privateNotes).toBe("");
    expect(result.campaign?.id).toBe(campaign.id);
  });
});

describe("getNounsForCampaign", () => {});

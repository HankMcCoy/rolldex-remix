import { describe, expect, test } from "@jest/globals";
import {
  createCampaign,
  createCampaignWithMember,
} from "~/test-utils/factories/campaign-factory";
import { createNoun } from "~/test-utils/factories/noun-factory";
import { getNounAndCampaign, getNounsForCampaign } from "./nouns.server";

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
    const { readOnlyUser, campaign } = await createCampaignWithMember();
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

  test("does not return matching secret noun and campaign for read only member", async () => {
    const { readOnlyUser, campaign } = await createCampaignWithMember();
    const noun = await createNoun({
      campaignId: campaign.id,
      overrides: {
        isSecret: true,
      },
    });

    const result = await getNounAndCampaign({
      nounId: noun.id,
      campaignId: campaign.id,
      userId: readOnlyUser.id,
    });

    expect(result.noun).toBe(null);
    expect(result.campaign).toBe(null);
  });
});

describe("getNounsForCampaign", () => {
  test("returns a noun with privateNotes for an admin", async () => {
    const campaign = await createCampaign();

    await createNoun({
      campaignId: campaign.id,
      overrides: {
        name: "Katy Wix",
        privateNotes: "Secrets",
      },
    });

    const nouns = await getNounsForCampaign({
      campaignId: campaign.id,
      userId: campaign.createdById,
    });

    expect(nouns).toHaveLength(1);
    expect(nouns[0].name).toBe("Katy Wix");
    expect(nouns[0].privateNotes).toBe("Secrets");
  });

  test("returns a noun without privateNotes for an read only member", async () => {
    const { readOnlyUser, campaign } = await createCampaignWithMember();

    await createNoun({
      campaignId: campaign.id,
      overrides: {
        name: "Katy Wix",
        privateNotes: "Secrets",
      },
    });

    const nouns = await getNounsForCampaign({
      campaignId: campaign.id,
      userId: readOnlyUser.id,
    });

    expect(nouns).toHaveLength(1);
    expect(nouns[0].name).toBe("Katy Wix");
    expect(nouns[0].privateNotes).toBe("");
  });

  test("does not return a secret noun for an read only member", async () => {
    const { readOnlyUser, campaign } = await createCampaignWithMember();

    await createNoun({
      campaignId: campaign.id,
      overrides: {
        name: "Katy Wix",
        isSecret: true,
      },
    });

    const nouns = await getNounsForCampaign({
      campaignId: campaign.id,
      userId: readOnlyUser.id,
    });

    expect(nouns).toHaveLength(0);
  });
});

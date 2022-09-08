import { describe, expect, test, afterEach } from "@jest/globals";
import { createCampaign } from "~/test-utils/factories/campaign-factory";
import { createMember } from "~/test-utils/factories/member-factory";
import { createNoun } from "~/test-utils/factories/noun-factory";
import { createUser } from "~/test-utils/factories/user-factory";
import { getRelationsForNoun } from "./related.server";

describe("getRelationsForNoun", () => {
  test("considers nouns A and B related if A's summary references B's name", async () => {
    const campaign = await createCampaign();
    const nounA = await createNoun({
      campaignId: campaign.id,
      overrides: {
        name: "Ed Gamble",
        summary: "Adopted son of Greg Davies",
      },
    });

    await Promise.all([
      // Create a related nounB
      createNoun({
        campaignId: campaign.id,
        overrides: {
          name: "Greg Davies",
          nounType: "PERSON",
        },
      }),
      // Create an unrelated noun
      createNoun({
        campaignId: campaign.id,
      }),
    ]);

    const relations = await getRelationsForNoun({
      userId: campaign.createdById,
      nounId: nounA.id,
      campaignId: campaign.id,
    });

    expect(relations.people).toHaveLength(1);
  });

  test("considers nouns A and B related if B's summary references A's name", async () => {
    const campaign = await createCampaign();
    const nounA = await createNoun({
      campaignId: campaign.id,
      overrides: {
        name: "Ed Gamble",
      },
    });

    await Promise.all([
      // Create a related nounB
      createNoun({
        campaignId: campaign.id,
        overrides: {
          name: "Greg Davies",
          summary: "Father to the capricious Ed Gamble",
          nounType: "PERSON",
        },
      }),
      // Create an unrelated noun
      createNoun({
        campaignId: campaign.id,
      }),
    ]);

    const relations = await getRelationsForNoun({
      userId: campaign.createdById,
      nounId: nounA.id,
      campaignId: campaign.id,
    });

    expect(relations.people).toHaveLength(1);
  });

  test("considers nouns A and B related if A's notes references B's name", async () => {
    const campaign = await createCampaign();
    const nounA = await createNoun({
      campaignId: campaign.id,
      overrides: {
        name: "Ed Gamble",
        notes: "# The history of his father, Greg Davies",
      },
    });

    await Promise.all([
      // Create a related nounB
      createNoun({
        campaignId: campaign.id,
        overrides: {
          name: "Greg Davies",
          nounType: "PERSON",
        },
      }),
      // Create an unrelated noun
      createNoun({
        campaignId: campaign.id,
      }),
    ]);

    const relations = await getRelationsForNoun({
      userId: campaign.createdById,
      nounId: nounA.id,
      campaignId: campaign.id,
    });

    expect(relations.people).toHaveLength(1);
  });

  test("considers nouns A and B related if B's notes references A's name", async () => {
    const campaign = await createCampaign();
    const nounA = await createNoun({
      campaignId: campaign.id,
      overrides: {
        name: "Ed Gamble",
      },
    });

    await Promise.all([
      // Create a related nounB
      createNoun({
        campaignId: campaign.id,
        overrides: {
          name: "Greg Davies",
          notes: "# His son, Ed Gamble",
          nounType: "PERSON",
        },
      }),
      // Create an unrelated noun
      createNoun({
        campaignId: campaign.id,
      }),
    ]);

    const relations = await getRelationsForNoun({
      userId: campaign.createdById,
      nounId: nounA.id,
      campaignId: campaign.id,
    });

    expect(relations.people).toHaveLength(1);
  });

  test("considers nouns A and B related if A's privateNotes references A's name when admin", async () => {
    const campaign = await createCampaign();
    const nounA = await createNoun({
      campaignId: campaign.id,
      overrides: {
        name: "Ed Gamble",
      },
    });

    await Promise.all([
      // Create a related nounB
      createNoun({
        campaignId: campaign.id,
        overrides: {
          name: "Greg Davies",
          privateNotes: "# His son, Ed Gamble",
          nounType: "PERSON",
        },
      }),
      // Create an unrelated noun
      createNoun({
        campaignId: campaign.id,
      }),
    ]);

    const relations = await getRelationsForNoun({
      userId: campaign.createdById,
      nounId: nounA.id,
      campaignId: campaign.id,
    });

    expect(relations.people).toHaveLength(1);
  });

  test("considers nouns A and B related if B's privateNotes references A's name when admin", async () => {
    const campaign = await createCampaign();
    const nounA = await createNoun({
      campaignId: campaign.id,
      overrides: {
        name: "Ed Gamble",
        privateNotes: "# His father, Greg Davies",
      },
    });

    await Promise.all([
      // Create a related nounB
      createNoun({
        campaignId: campaign.id,
        overrides: {
          name: "Greg Davies",
          nounType: "PERSON",
        },
      }),
      // Create an unrelated noun
      createNoun({
        campaignId: campaign.id,
      }),
    ]);

    const relations = await getRelationsForNoun({
      userId: campaign.createdById,
      nounId: nounA.id,
      campaignId: campaign.id,
    });

    expect(relations.people).toHaveLength(1);
  });

  test("does not consider nouns A and B related if A's privateNotes references A's name when read only", async () => {
    const campaign = await createCampaign();
    const readOnlyUser = await createUser();
    await createMember({
      campaignId: campaign.id,
      overrides: { email: readOnlyUser.email },
    });

    const nounA = await createNoun({
      campaignId: campaign.id,
      overrides: {
        name: "Ed Gamble",
      },
    });

    await Promise.all([
      // Create a related nounB
      createNoun({
        campaignId: campaign.id,
        overrides: {
          name: "Greg Davies",
          privateNotes: "# His son, Ed Gamble",
          nounType: "PERSON",
        },
      }),
      // Create an unrelated noun
      createNoun({
        campaignId: campaign.id,
      }),
    ]);

    const relations = await getRelationsForNoun({
      userId: readOnlyUser.id,
      nounId: nounA.id,
      campaignId: campaign.id,
    });

    expect(relations.people).toHaveLength(0);
  });

  test("does not consider nouns A and B related if B's privateNotes references A's name when read only", async () => {
    const campaign = await createCampaign();
    const readOnlyUser = await createUser();
    await createMember({
      campaignId: campaign.id,
      overrides: { email: readOnlyUser.email },
    });

    const nounA = await createNoun({
      campaignId: campaign.id,
      overrides: {
        name: "Ed Gamble",
        privateNotes: "# His father, Greg Davies",
      },
    });

    await Promise.all([
      // Create a related nounB
      createNoun({
        campaignId: campaign.id,
        overrides: {
          name: "Greg Davies",
          nounType: "PERSON",
        },
      }),
      // Create an unrelated noun
      createNoun({
        campaignId: campaign.id,
      }),
    ]);

    const relations = await getRelationsForNoun({
      userId: readOnlyUser.id,
      nounId: nounA.id,
      campaignId: campaign.id,
    });

    expect(relations.people).toHaveLength(0);
  });
});

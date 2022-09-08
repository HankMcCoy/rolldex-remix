import { db } from "~/db.server";
import { randText, randParagraph, rand } from "@ngneat/falso";

interface Overrides {
  name?: string;
  summary?: string;
  notes?: string;
  privateNotes?: string;
}

interface Args {
  campaignId: string;
  overrides?: Overrides;
}
export async function createSession({ campaignId, overrides }: Args) {
  return db.session.create({
    data: {
      campaignId,
      name: overrides?.name ?? randText(),
      summary: overrides?.summary ?? randParagraph(),
      notes: overrides?.notes ?? randParagraph(),
      privateNotes: overrides?.privateNotes ?? randParagraph(),
    },
  });
}

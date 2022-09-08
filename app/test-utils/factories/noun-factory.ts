import { db } from "~/db.server";
import { incrementalNumber, randText, rand, randAlpha } from "@ngneat/falso";
import { NounType, nounTypeList } from "~/util/noun-type-helpers";

interface Overrides {
  name?: string;
  summary?: string;
  nounType?: NounType;
  notes?: string;
  privateNotes?: string;
  isSecret?: boolean;
}

interface Args {
  campaignId: string;
  overrides?: Overrides;
}
export async function createNoun({ campaignId, overrides }: Args) {
  const nounNum = incrementalNumber();
  return db.noun.create({
    data: {
      campaignId,
      nounType: overrides?.nounType ?? rand(nounTypeList),

      // Make name and summary very basic to avoid accidental name matches
      name: overrides?.name ?? `noun-${nounNum}`,
      summary: overrides?.summary ?? `summary-${nounNum}`,

      notes: overrides?.notes ?? "",
      privateNotes: overrides?.privateNotes ?? "",
      isSecret: overrides?.isSecret ?? false,
    },
  });
}

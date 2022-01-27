import { Noun, Session } from "@prisma/client";
import { db } from "~/db.server";

type Searchable = {
  name: string;
  summary: string;
  notes: string;
  privateNotes: string;
};
function getSearchText(s: Searchable): string {
  return [s.summary, s.notes, s.privateNotes]
    .join("\n\n")
    .toLowerCase()
    .replace(/'s/g, "");
}

// A noun A's content matches another noun B's name if:
//    A's summary, notes, or private notes, when converted to lower case, with possessives (e.g. "'s") removed
//    contains B's lower cased name
function referenceEachOther(a: Searchable, b: Searchable) {
  const contentA = getSearchText(a);
  const searchNameB = b.name.toLowerCase();
  if (contentA.indexOf(searchNameB) !== -1) return true;

  const contentB = getSearchText(b);
  const searchNameA = a.name.toLowerCase();
  if (contentB.indexOf(searchNameA) !== -1) return true;

  return false;
}
type GetRelatedNounsArgs = {
  nounId: string;
  campaignId: string;
};
export async function getRelations({
  nounId,
  campaignId,
}: GetRelatedNounsArgs): Promise<{
  nouns: Array<Noun>;
  sessions: Array<Session>;
}> {
  const [noun, allNouns, allSessions] = await Promise.all([
    db.noun.findUnique({ where: { id: nounId } }),
    db.noun.findMany({ where: { campaignId } }),
    db.session.findMany({ where: { campaignId } }),
  ]);
  if (!noun) throw new Response("Not found", { status: 404 });

  return {
    nouns: allNouns.filter((nounToCheck) =>
      referenceEachOther(noun, nounToCheck)
    ),
    sessions: allSessions.filter((session) =>
      referenceEachOther(noun, session)
    ),
  };
}

import { Noun, Session } from "@prisma/client";
import { db } from "~/db.server";
import { getCampaign } from "./campaigns.server";

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

type NounsByType = {
  people: Array<Noun>;
  places: Array<Noun>;
  things: Array<Noun>;
  factions: Array<Noun>;
};
function splitNounsByType(nouns: Array<Noun>): NounsByType {
  return {
    people: nouns.filter((n) => n.nounType === "PERSON"),
    places: nouns.filter((n) => n.nounType === "PLACE"),
    things: nouns.filter((n) => n.nounType === "THING"),
    factions: nouns.filter((n) => n.nounType === "FACTION"),
  };
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
type GetRelationsForNounArgs = {
  nounId: string;
  campaignId: string;
};
export async function getRelationsForNoun({
  nounId,
  campaignId,
}: GetRelationsForNounArgs): Promise<{
  people: Array<Noun>;
  places: Array<Noun>;
  things: Array<Noun>;
  factions: Array<Noun>;
  sessions: Array<Session>;
}> {
  const [noun, allNouns, allSessions] = await Promise.all([
    db.noun.findUnique({ where: { id: nounId } }),
    db.noun.findMany({ where: { campaignId } }),
    db.session.findMany({ where: { campaignId } }),
  ]);
  if (!noun) throw new Response("Not found", { status: 404 });
  const matchingNouns = allNouns.filter((nounToCheck) =>
    referenceEachOther(noun, nounToCheck)
  );

  return {
    ...splitNounsByType(matchingNouns),
    sessions: allSessions.filter((session) =>
      referenceEachOther(noun, session)
    ),
  };
}
type GetRelationsForSessionArgs = {
  sessionId: string;
  campaignId: string;
  userId: string;
};
export async function getRelationsForSession({
  sessionId,
  campaignId,
  userId,
}: GetRelationsForSessionArgs): Promise<NounsByType> {
  await getCampaign({ campaignId, userId });

  const [session, allNouns] = await Promise.all([
    db.session.findUnique({ where: { id: sessionId } }),
    db.noun.findMany({ where: { campaignId } }),
  ]);
  if (!session) throw new Response("Not found", { status: 404 });

  return splitNounsByType(
    allNouns.filter((nounToCheck) => referenceEachOther(session, nounToCheck))
  );
}

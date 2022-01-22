import { $Diff } from "utility-types";
import campaignsRaw from "./campaigns.json";
import nounsRaw from "./nouns.json";
import sessionsRaw from "./sessions.json";
import membersRaw from "./members.json";

const indexBy = <T extends object>(
  list: Array<T>,
  key: string
): Record<string, T> =>
  list.reduce((dict, x) => {
    if (!(key in x)) throw new Error("Index failed");
    return { ...dict, [(x as any)[key]]: x };
  }, {});

/**
 * CAMPAIGNS
 */
export type Campaign = {
  id: number;
  name: string;
  description: string;
  inserted_at: string;
  updated_at: string;
  created_by_id: number;
};

export type DraftCampaign = $Diff<
  Campaign,
  {
    id: number;
    inserted_at: string;
    updated_at: string;
    created_by_id: number;
  }
>;

export const campaigns = campaignsRaw as Array<Campaign>;
export const campaignsById = indexBy(campaigns, "id");

/**
 * NOUNS
 */
const NounTypeMap = Object.freeze({
  PERSON: null,
  PLACE: null,
  THING: null,
  FACTION: null,
});
export type NounType = keyof typeof NounTypeMap;
export const asNounType = (
  val: string | undefined | null
): NounType | undefined => {
  if (val && NounTypeMap.hasOwnProperty(val.toUpperCase())) {
    return val.toUpperCase() as NounType;
  }
  return undefined;
};

export const getNounTypeFromUrlFragment = (
  fragment: string | null
): NounType | undefined => {
  switch (fragment) {
    case "people":
      return "PERSON";
    case "places":
      return "PLACE";
    case "things":
      return "THING";
    case "factions":
      return "FACTION";
    default:
      return undefined;
  }
};

export type Noun = {
  id: number;
  name: string;
  campaign_id: number;
  noun_type: NounType;
  summary: string;
  notes: string;
  private_notes: string;
  inserted_at: string;
  updated_at: string;
};

export type DraftNoun = $Diff<
  Noun,
  { id: number; inserted_at: string; updated_at: string }
>;

export const nouns = nounsRaw as Array<Noun>;
export const nounsById = indexBy(nouns, "id");

export const nounTypePluralDisplayText: Record<string, string> = {
  PERSON: "People",
  PLACE: "Places",
  THING: "Things",
  FACTION: "Factions",
};
export const nounTypeSingularDisplayText: Record<string, string> = {
  PERSON: "Person",
  PLACE: "Place",
  THING: "Thing",
  FACTION: "Faction",
};
export const nounTypeUrlFragment: Record<string, string> = {
  PERSON: "people",
  PLACE: "places",
  THING: "things",
  FACTION: "factions",
};

/**
 * SESSIONS
 */

export type Session = {
  id: number;
  name: string;
  campaign_id: number;
  summary: string;
  notes: string;
  private_notes: string;
  inserted_at: string;
  updated_at: string;
};

export type DraftSession = $Diff<
  Session,
  { id: number; inserted_at: string; updated_at: string }
>;
export const sessions = sessionsRaw as Array<Session>;
export const sessionsById = indexBy(sessions, "id");

/**
 * MEMBERS
 */
export type MemberType = "READ_ONLY";
export type Member = {
  id: number;
  inserted_at: string;
  updated_at: string;

  user_id: number;
  campaign_id: number;
  email: string;
  member_type: MemberType;
};

export type DraftMember = $Diff<
  Member,
  { id: number; inserted_at: string; updated_at: string; user_id: number }
>;
export const members = membersRaw as Array<Member>;

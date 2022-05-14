import { $Diff } from "utility-types";

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

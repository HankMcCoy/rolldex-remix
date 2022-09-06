import { Noun } from "@prisma/client";
import { NounType } from "~/util/noun-type-helpers";
import { TextField, LabelRow, TextareaField, MarkdownField } from "../forms";

export const getFields = ({
  data,
  errors,
}: {
  data: {
    campaignId: string;
    id?: string;
    name?: string;
    nounType?: string;
    summary?: string;
    notes?: string;
    privateNotes?: string;
  };
  errors: {
    name?: string[];
    nounType?: string[];
    summary?: string[];
    notes?: string[];
    privateNotes?: string[];
  };
}) => (
  <>
    {!!data.id && <input type="hidden" name="nounId" value={data.id} />}
    <input type="hidden" name="campaignId" value={data.campaignId} />
    <TextField
      name="name"
      label="Name:"
      defaultValue={data.name}
      errors={errors.name}
    />
    <LabelRow label="Noun Type" errors={errors.nounType}>
      <select
        name="nounType"
        className="w-full"
        required
        defaultValue={data.nounType}
      >
        <option></option>
        <option value="PERSON">Person</option>
        <option value="PLACE">Place</option>
        <option value="THING">Thing</option>
        <option value="FACTION">Faction</option>
      </select>
    </LabelRow>
    <TextareaField
      name="summary"
      label="Summary:"
      defaultValue={data.summary}
      rows={3}
      errors={errors.summary}
    />
    <MarkdownField
      name="notes"
      label="Notes:"
      defaultValue={data.notes}
      errors={errors.notes}
    />
    <MarkdownField
      name="privateNotes"
      label="Private Notes:"
      defaultValue={data.privateNotes}
      errors={errors.privateNotes}
    />
  </>
);

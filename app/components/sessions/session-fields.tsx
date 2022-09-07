import { TextField, LabelRow, TextareaField, MarkdownField } from "../forms";

export const SessionFields = ({
  data,
  errors,
}: {
  data?: {
    name?: string;
    summary?: string;
    notes?: string;
    privateNotes?: string;
  };
  errors?: {
    name?: string[];
    summary?: string[];
    notes?: string[];
    privateNotes?: string[];
  };
}) => (
  <>
    <TextField
      name="name"
      label="Name:"
      defaultValue={data?.name}
      errors={errors?.name}
    />
    <TextareaField
      name="summary"
      label="Summary:"
      defaultValue={data?.summary}
      rows={3}
      errors={errors?.summary}
    />
    <MarkdownField
      name="notes"
      label="Notes:"
      defaultValue={data?.notes}
      errors={errors?.notes}
    />
    <MarkdownField
      name="privateNotes"
      label="Private Notes:"
      defaultValue={data?.privateNotes}
      errors={errors?.privateNotes}
    />
  </>
);

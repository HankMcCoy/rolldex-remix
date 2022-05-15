import { asString } from "./util";
import { json } from "remix";

type GetFormFieldsArgs = {
  request: Request;
};
export const getFormFields = async ({ request }: GetFormFieldsArgs) => {
  const formData = await request.formData();

  const fields = [...formData.keys()].reduce(
    (obj, field) => ({
      ...obj,
      [field]: asString(formData.get(field)),
    }),
    {} as { [k: string]: string }
  );

  return {
    fields,
  };
};

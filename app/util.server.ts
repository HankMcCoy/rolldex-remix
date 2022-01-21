import { asString } from "./util";
import { getUserId } from "./session.server";

type GetFormFieldsArgs = {
  request: Request;
  fieldNames: Array<string>;
};
export const getFormFields = async ({
  request,
  fieldNames,
}: GetFormFieldsArgs) => {
  const [body, userId] = await Promise.all([
    request.formData(),
    getUserId(request),
  ]);
  if (userId === null) throw new Error("Uh oh, 401");

  const fields = fieldNames.reduce(
    (obj, field) => ({
      ...obj,
      [field]: asString(body.get(field)),
    }),
    {} as { [k: string]: string }
  );

  return {
    fields,
    userId,
  };
};

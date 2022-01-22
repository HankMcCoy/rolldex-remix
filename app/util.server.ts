import { asString } from "./util";
import { getUserId } from "./session.server";

type GetFormFieldsArgs = {
  request: Request;
};
export const getFormFields = async ({ request }: GetFormFieldsArgs) => {
  const [formData, userId] = await Promise.all([
    request.formData(),
    getUserId(request),
  ]);
  if (userId === null) throw new Error("Uh oh, 401");

  const fields = [...formData.keys()].reduce(
    (obj, field) => ({
      ...obj,
      [field]: asString(formData.get(field)),
    }),
    {} as { [k: string]: string }
  );

  return {
    fields,
    userId,
  };
};

import { randEmail, randPassword } from "@ngneat/falso";
import { db } from "~/db.server";

interface Overrides {
  email?: string;
}
interface Args {
  overrides?: Overrides;
}
export async function createUser({ overrides }: Args = {}) {
  return db.user.create({
    data: {
      email: overrides?.email ?? randEmail(),
      passwordHash: randPassword(),
    },
  });
}

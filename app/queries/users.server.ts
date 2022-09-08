import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { db } from "~/db.server";
import { comparePassword, hashPassword } from "./authentication.server";

export const MIN_PASSWORD_LENGTH = 8;

export class DuplicateEmailError extends Error {
  constructor() {
    super();
    this.name = "DuplicateEmailError";
  }
}

export class EmailNotAllowed extends Error {
  constructor() {
    super();
    this.name = "EmailNotAllowed";
  }
}

export const handleDuplicateEmail = (e: Error) => {
  if (e instanceof PrismaClientKnownRequestError && e.code === "P2002") {
    const meta = e.meta as { target: string[] };
    if (meta.target.includes("email")) {
      throw new DuplicateEmailError();
    }
  }
  throw e;
};

export async function createUser({
  email,
  plaintextPassword,
}: {
  email: string;
  plaintextPassword: string;
}) {
  const allowedEmails = (process.env.ALLOWED_EMAILS || "").split(",");
  if (!allowedEmails.includes(email)) {
    throw new EmailNotAllowed();
  }

  const passwordHash = await hashPassword(plaintextPassword);
  return await db.user
    .create({ data: { email, passwordHash } })
    .catch(handleDuplicateEmail);
}

export async function getUserByLogin({
  email,
  plaintextPassword,
}: {
  email: string;
  plaintextPassword: string;
}) {
  const user = await db.user.findUnique({ where: { email } });
  let isValidLogin: boolean = false;

  if (user) {
    isValidLogin = await comparePassword(plaintextPassword, user);
  }
  return isValidLogin ? user : undefined;
}

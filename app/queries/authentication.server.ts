import { User } from "@prisma/client";
import bcrypt from "bcrypt";
const saltRounds = 10;

export async function hashPassword(plaintextPassword: string): Promise<string> {
  return bcrypt.hash(plaintextPassword, saltRounds);
}

export async function comparePassword(plaintextPassword: string, user: User) {
  return bcrypt.compare(plaintextPassword, user.passwordHash);
}

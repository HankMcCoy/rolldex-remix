import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

export class DuplicateNameError extends Error {
  constructor() {
    super();
    this.name = "DuplicateNameError";
  }
}

export const handleDuplicateName = (e: Error) => {
  if (e instanceof PrismaClientKnownRequestError && e.code === "P2002") {
    const meta = e.meta as { target: string[] };
    if (meta.target.includes("name")) {
      throw new DuplicateNameError();
    }
  }
  throw e;
};

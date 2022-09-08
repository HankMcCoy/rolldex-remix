import {
  describe,
  expect,
  test,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import { randEmail, randPassword } from "@ngneat/falso";

import {
  createUser,
  EmailNotAllowed,
  DuplicateEmailError,
  getUserByLogin,
} from "./users.server";

describe("createUser", () => {
  let origEnv = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...origEnv };
  });
  afterEach(() => {
    process.env = origEnv;
  });

  test("it creates a user", async () => {
    const allowedEmail = randEmail();
    process.env.ALLOWED_EMAILS = allowedEmail;
    const user = await createUser({
      email: allowedEmail,
      plaintextPassword: randPassword(),
    });
    expect(user).toBeTruthy();
  });

  test("it throws an error if the user is not allowed", async () => {
    const allowedEmail = randEmail();
    const otherEmail = randEmail();

    process.env.ALLOWED_EMAILS = allowedEmail;

    expect(
      createUser({
        email: otherEmail,
        plaintextPassword: randPassword(),
      })
    ).rejects.toBeInstanceOf(EmailNotAllowed);
  });

  test("it throws an error if there is already a user with the same email", async () => {
    const allowedEmail = randEmail();

    process.env.ALLOWED_EMAILS = allowedEmail;
    await createUser({
      email: allowedEmail,
      plaintextPassword: randPassword(),
    });

    expect(
      createUser({
        email: allowedEmail,
        plaintextPassword: randPassword(),
      })
    ).rejects.toBeInstanceOf(DuplicateEmailError);
  });
});

describe("getUserByLogin", () => {
  test("returns user for correct login", async () => {
    const allowedEmail = randEmail();
    const password = randPassword();

    process.env.ALLOWED_EMAILS = allowedEmail;
    const user = await createUser({
      email: allowedEmail,
      plaintextPassword: password,
    });

    expect(
      getUserByLogin({ email: allowedEmail, plaintextPassword: password })
    ).resolves.toHaveProperty("id", user.id);
  });

  test("returns undefined on an incorrect login", async () => {
    const allowedEmail = randEmail();
    const correctPassword = randPassword();
    const wrongPassword = randPassword();

    process.env.ALLOWED_EMAILS = allowedEmail;
    const user = await createUser({
      email: allowedEmail,
      plaintextPassword: correctPassword,
    });

    expect(
      getUserByLogin({ email: allowedEmail, plaintextPassword: wrongPassword })
    ).resolves.toBeUndefined();
  });
});

import { createCookieSessionStorage } from "@remix-run/node";

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "__session",
      secrets: [process.env.SESSION_SECRET_1!],
      sameSite: "lax",
      httpOnly: true,
      path: "/"
    }
  });

export { getSession, commitSession, destroySession };

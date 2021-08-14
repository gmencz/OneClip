import { createCookieSessionStorage } from "remix";

let { getSession, commitSession, destroySession } = createCookieSessionStorage({
  cookie: {
    name: "__session"
  }
});

export { getSession, commitSession, destroySession };

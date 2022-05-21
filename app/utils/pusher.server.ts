import Pusher from "pusher";

const appId = process.env.PUSHER_APP_ID;
if (!appId) {
  throw new Error("PUSHER_APP_ID environment variable is missing");
}

const key = process.env.PUSHER_KEY;
if (!key) {
  throw new Error("PUSHER_KEY environment variable is missing");
}

const secret = process.env.PUSHER_SECRET;
if (!secret) {
  throw new Error("PUSHER_SECRET environment variable is missing");
}

const cluster = process.env.PUBLIC_PUSHER_CLUSTER;
if (!cluster) {
  throw new Error("PUBLIC_PUSHER_CLUSTER environment variable is missing");
}

const rest = new Pusher({
  appId,
  key,
  secret,
  cluster,
  useTLS: true
});

export { rest };

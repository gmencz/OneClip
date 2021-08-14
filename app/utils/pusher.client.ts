import Pusher from "pusher-js";

if (!window.env.PUBLIC_PUSHER_CLUSTER) {
  throw new Error("PUBLIC_PUSHER_CLUSTER is missing");
}

if (!window.env.PUBLIC_PUSHER_KEY) {
  throw new Error("PUBLIC_PUSHER_KEY is missing");
}

let pusher = new Pusher(window.env.PUBLIC_PUSHER_KEY, {
  cluster: window.env.PUBLIC_PUSHER_CLUSTER,
  auth: {
    params: {
      device: localStorage.getItem("device") ?? undefined
    }
  }
});

export { pusher };

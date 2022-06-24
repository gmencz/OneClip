import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getNetworkChannelName } from "~/utils/channels";
import { rest } from "~/utils/pusher.server";

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ message: "Method not allowed" }, { status: 405 });
  }

  const payload = await request.formData();
  const rawDevice = payload.get("device");
  const socketID = payload.get("socket_id");
  const channelName = payload.get("channel_name");
  const networkID = payload.get("network_id");

  if (
    typeof rawDevice !== "string" ||
    typeof channelName !== "string" ||
    typeof socketID !== "string" ||
    typeof networkID !== "string"
  ) {
    return json({ error: "Invalid payload" }, { status: 400 });
  }

  const device = JSON.parse(rawDevice);
  if (!device) {
    return json({ error: "Unknown device" }, { status: 401 });
  }

  if (channelName.startsWith("presence")) {
    if (channelName !== getNetworkChannelName(networkID)) {
      return json(
        {
          error: "You can't subscribe to this network"
        },
        { status: 401 }
      );
    }

    let auth;
    try {
      auth = rest.authenticate(socketID, channelName, {
        user_id: device.name,
        user_info: {
          type: device.type
        }
      });
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return json({ error: error.message }, { status: 500 });
      }

      return json({ error: "Internal Server Error" }, { status: 500 });
    }

    return json(auth);
  }

  const auth = rest.authenticate(socketID, channelName);
  return json(auth);
};

import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getClientIPAddress } from "remix-utils";
import { rest } from "~/utils/pusher.server";
import { snakeCase } from "~/utils/strings";

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ message: "Method not allowed" }, { status: 405 });
  }

  const payload = await request.formData();
  const rawDevice = payload.get("device");
  const socketId = payload.get("socket_id");
  const channelName = payload.get("channel_name");
  if (
    typeof rawDevice !== "string" ||
    typeof channelName !== "string" ||
    typeof socketId !== "string"
  ) {
    return json({ error: "Invalid payload" }, { status: 400 });
  }

  const ipAddress =
    process.env.NODE_ENV === "production"
      ? getClientIPAddress(request.headers)
      : "127.0.0.1";

  if (!ipAddress) {
    return json(
      { error: "Failed to retrieve public IP address" },
      { status: 500 }
    );
  }

  const base64IP = Buffer.from(ipAddress).toString("base64");
  const device = JSON.parse(rawDevice);
  if (!device) {
    return json({ error: "Unknown device" }, { status: 401 });
  }

  if (channelName.startsWith("presence")) {
    if (channelName !== `presence-${base64IP}`) {
      return json(
        {
          error: "You can only subscribe to presence channels in your network"
        },
        { status: 401 }
      );
    }

    let auth;
    try {
      auth = rest.authenticate(socketId, channelName, {
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

  if (channelName !== `private-${snakeCase(device.name)}-${base64IP}`) {
    return json(
      {
        error:
          "You can only subscribe to private channels related to your device"
      },
      { status: 401 }
    );
  }

  const auth = rest.authenticate(socketId, channelName);
  return json(auth);
};

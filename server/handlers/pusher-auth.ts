import { Request, Response } from "express";
import { getClientIp } from "request-ip";
import { rest } from "../../app/utils/pusher.server";
import { snakeCase } from "../../app/utils/words";

const handlePusherAuth = (req: Request, res: Response) => {
  let rawDevice = req.body.device;
  let socketId = req.body.socket_id;
  let channelName = req.body.channel_name;
  if (
    typeof rawDevice !== "string" ||
    typeof channelName !== "string" ||
    typeof socketId !== "string"
  ) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  let ip = getClientIp(req);
  if (!ip) {
    return res
      .status(500)
      .json({ error: "Failed to retrieve public IP address" });
  }

  let base64IP = Buffer.from(ip).toString("base64");
  let device = JSON.parse(rawDevice);
  if (!device) {
    return res.status(401).json({ error: "Unknown device" });
  }

  if (channelName.startsWith("presence")) {
    if (channelName !== `presence-${base64IP}`) {
      return res.status(401).json({
        error:
          "You can only subscribe to presence channels related to your network"
      });
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
      return res.status(500).json({ error: error.message });
    }
    return res.send(auth);
  }

  if (channelName !== `private-${snakeCase(device.name)}-${base64IP}`) {
    return res.status(401).json({
      error: "You can only subscribe to private channels related to your device"
    });
  }

  let auth = rest.authenticate(socketId, channelName);
  return res.send(auth);
};

export { handlePusherAuth };

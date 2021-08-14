import { Request, Response } from "express";
import { rest } from "../../app/utils/pusher.server";

const handlePusherAuth = (req: Request, res: Response) => {
  let rawDevice = req.body.device;
  let socketId = req.body.socket_id;
  let channel = req.body.channel_name;
  if (
    typeof rawDevice !== "string" ||
    typeof channel !== "string" ||
    typeof socketId !== "string"
  ) {
    return res
      .status(400)
      .json({ error: "device, channel_name and socket_id are required" });
  }

  if (channel.startsWith("presence")) {
    // TODO: Make sure IP "x.x.x.x" can only subscribe to presence
    // channel "x.x.x.x"
    let device = JSON.parse(rawDevice);
    let auth;
    try {
      auth = rest.authenticate(socketId, channel, {
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

  let auth = rest.authenticate(socketId, channel);
  return res.send(auth);
};

export { handlePusherAuth };

import { GetLoadContextFunction } from "@remix-run/express";
import { getClientIp } from "request-ip";

const getLoadContext: GetLoadContextFunction = req => {
  let ip = getClientIp(req);
  return { ip };
};

export { getLoadContext };

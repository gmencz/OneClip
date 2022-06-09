import { snakeCase } from "./strings";

export function getNetworkChannelName(networkID: string) {
  return `presence-network-${networkID}`;
}

export function getDeviceChannelName(deviceName: string, networkID: string) {
  return `private-${snakeCase(deviceName)}-network-${networkID}`;
}

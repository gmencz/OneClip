import { LoaderFunction } from "remix";
import { Device } from "../utils/device";
import { getEnv } from "../utils/env";

type LoaderContext = {
  ip: string | null;
};

type Loader<Params extends Record<string, unknown> = Record<string, unknown>> =
  (
    args: Omit<Parameters<LoaderFunction>["0"], "params" | "context"> & {
      params: Params;
      context: LoaderContext;
    }
  ) => ReturnType<LoaderFunction>;

type Env = ReturnType<typeof getEnv>;

export type ClipboardData = {
  from: Device;
  text: string;
};

export { Loader, Env };

import shortid from "shortid";
import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export const loader: LoaderFunction = () => {
  // If the user visits "/", we assume that the user is new to the app so we create a network
  // ID for them that they can use to share their clipboard in that network.
  const networkID = shortid.generate();
  return redirect(`/${networkID}`);
};

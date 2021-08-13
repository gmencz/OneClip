import type { MetaFunction } from "remix";

export let meta: MetaFunction = () => {
  return {
    title: "OneClip",
    description: "Share your clipboard from any device, anywhere.",
  };
};

export default function Index() {
  return null;
}

import type { MetaFunction } from "remix";

export let meta: MetaFunction = () => {
  return {
    title: "OneClip",
    description: "Share your clipboard from any device, anywhere."
  };
};

export default function Index() {
  return (
    <div className="flex items-center justify-center min-h-screen text-red-400">
      <p>Waiting for devices...</p>
    </div>
  );
}

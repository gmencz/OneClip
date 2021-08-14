import { Channel } from "pusher-js";
import { Config } from "pusher-js/types/src/core/config";
import { useEffect, useRef, useState } from "react";
import { pusher } from "./pusher.client";

type SubscriptionError = {
  type: string;
  error: string;
  status: number;
};

type State = {
  status: "loading" | "success" | "error";
  error: string | null;
};

type UseSubscriptionOptions = {
  enabled?: boolean;
  config?: Partial<Config>;
};

function useSubscription(
  channelName: string,
  options?: UseSubscriptionOptions
) {
  let channel = useRef<Channel>();
  let [state, setState] = useState<State>({
    status: "loading",
    error: null
  });

  useEffect(() => {
    if (!options?.enabled) {
      return;
    }

    if (options.config) {
      pusher.config = { ...pusher.config, ...options.config };
    }

    channel.current = pusher.subscribe(channelName);

    channel.current.bind("pusher:subscription_succeeded", () => {
      setState({
        status: "success",
        error: null
      });
    });

    channel.current.bind(
      "pusher:subscription_error",
      (err: SubscriptionError) => {
        setState({
          status: "error",
          error: err.error
        });
      }
    );
  }, [channelName, options?.config, options?.enabled]);

  return {
    channel: channel.current,
    error: state.error,
    status: state.status,
    isLoading: state.status === "loading",
    isSuccess: state.status === "success",
    isError: state.status === "error"
  };
}

export { useSubscription };

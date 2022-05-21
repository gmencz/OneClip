import type Pusher from "pusher-js";
import type { Channel } from "pusher-js";
import { useEffect, useRef, useState } from "react";

interface SubscriptionError {
  type: string;
  error: string;
  status: number;
}

interface SubscriptionState {
  status: "loading" | "success" | "error";
  error: string | null;
}

function usePusherSubscription(
  pusher: Pusher | undefined,
  channelName: string
) {
  const channel = useRef<Channel>();
  const [state, setState] = useState<SubscriptionState>({
    status: "loading",
    error: null
  });

  useEffect(() => {
    if (!pusher) {
      return;
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
  }, [channelName, pusher]);

  return {
    channel: channel.current,
    error: state.error,
    status: state.status,
    isLoading: state.status === "loading",
    isSuccess: state.status === "success",
    isError: state.status === "error"
  };
}

export { usePusherSubscription };

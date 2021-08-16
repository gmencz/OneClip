import Pusher, { Channel } from "pusher-js";
import { useEffect, useRef, useState } from "react";

type SubscriptionError = {
  type: string;
  error: string;
  status: number;
};

type State = {
  status: "loading" | "success" | "error";
  error: string | null;
};

function useSubscription(pusher: Pusher | undefined, channelName: string) {
  let channel = useRef<Channel>();
  let [state, setState] = useState<State>({
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

export { useSubscription };

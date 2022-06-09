import { PusherProvider, usePusher } from "@harelpls/use-pusher";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { isFirefox, isIE } from "react-device-detect";
import { Toaster } from "react-hot-toast";
import { ClipboardToasts } from "~/components/clipboard-toasts";
import { Connecting } from "~/components/connecting";
import { DeviceSubscriptions } from "~/components/device-subscriptions";
import { ErrorScreen } from "~/components/error-screen";
import { Header } from "~/components/header";
import { MainScreen } from "~/components/main-screen";
import { NotificationsProvider } from "~/components/notifications-provider";
import { useDeviceInfo } from "~/hooks/use-device-info";
import type { Device } from "~/types";
import { getNetworkChannelName } from "~/utils/channels";
import { rest } from "~/utils/pusher.server";
import { commitSession, getSession } from "~/utils/sessions";

export const loader: LoaderFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const networkID = params.network;
  if (!networkID) {
    return json(
      { error: "Internal Server Error" },
      {
        status: 500
      }
    );
  }

  const response = await rest.get({
    path: `/channels/${getNetworkChannelName(networkID)}/users`
  });

  if (!response.ok) {
    return json(
      { error: "Internal Server Error" },
      {
        status: 500
      }
    );
  }

  const body = await response.json();
  const allDevices = (body.users as { id: string }[]).map(device => device.id);

  if (allDevices.length >= 100) {
    return json(
      { error: "Network is full, try again later" },
      {
        status: 500
      }
    );
  }

  return json(
    { networkID, allDevices },
    {
      headers: {
        "Set-Cookie": await commitSession(session)
      }
    }
  );
};

export const action: ActionFunction = async ({ request }) => {
  const body = new URLSearchParams(await request.text());
  const fromName = body.get("fromName");
  const fromType = body.get("fromType");
  const deviceChannel = body.get("channel");
  const text = body.get("text");
  const deviceName = body.get("deviceName");

  if (!deviceChannel || !fromName || !fromType || !text || !deviceName) {
    return json(
      {
        clipboardError: "Invalid payload"
      },
      { status: 400 }
    );
  }

  let response;

  try {
    response = await rest.trigger(deviceChannel, "copy-to-clipboard", {
      from: {
        name: fromName,
        type: fromType
      },
      text
    });
  } catch (error) {
    return json(
      {
        clipboardError: "Internal Server Error"
      },
      { status: 500 }
    );
  }

  if (!response.ok) {
    return json(
      {
        clipboardError: "Internal Server Error"
      },
      { status: 500 }
    );
  }

  return json({ lastDeviceName: deviceName });
};

interface LoaderData {
  networkID?: string;
  clipboardError?: string;
  error?: string;
  allDevices?: string[];
}

export interface ActionData {
  clipboardError?: string;
  lastDeviceName?: string;
}

export default function Network() {
  const { error, networkID, allDevices } = useLoaderData<LoaderData>();
  const deviceInfo = useDeviceInfo({ allDevices: allDevices || [] });

  if (isFirefox) {
    return (
      <ErrorScreen>
        <p className="text-red-500 text-lg">
          Firefox is not supported. Download Chrome/Edge/Opera/Brave.
        </p>
      </ErrorScreen>
    );
  }

  if (isIE) {
    return (
      <ErrorScreen>
        <p className="text-red-500 text-lg">
          Internet Explorer is not supported. Download Chrome/Edge/Opera/Brave.
        </p>
      </ErrorScreen>
    );
  }

  if (error || !networkID) {
    return (
      <ErrorScreen>
        <p className="text-red-500 text-lg">
          Failed to connect, reason: {error ?? "unknown"}
        </p>
      </ErrorScreen>
    );
  }

  if (!deviceInfo) {
    return (
      <div className="p-12 flex flex-1 flex-col items-center justify-center relative">
        <Connecting />
      </div>
    );
  }

  return (
    <NotificationsProvider>
      <PusherProvider
        clientKey={window.ENV.PUBLIC_PUSHER_KEY}
        cluster={window.ENV.PUBLIC_PUSHER_CLUSTER}
        authEndpoint="/api/pusher/auth"
        auth={{
          params: { device: JSON.stringify(deviceInfo), network_id: networkID }
        }}
      >
        <div className="h-full bg-gray-900 relative flex flex-col">
          <Header />

          <div className="p-12 flex flex-1 flex-col items-center justify-center relative">
            <View deviceInfo={deviceInfo} networkID={networkID} />
          </div>
        </div>

        <Toaster />
      </PusherProvider>
    </NotificationsProvider>
  );
}

interface ViewProps {
  deviceInfo: Device;
  networkID: string;
}

function View({ deviceInfo, networkID }: ViewProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const pusher = usePusher();

  // Disconnect from pusher when we leave this route.
  useEffect(() => {
    return () => {
      pusher.client?.disconnect();
    };
  }, [pusher.client]);

  return (
    <>
      <MainScreen
        devices={devices}
        deviceInfo={deviceInfo}
        networkID={networkID}
      />

      <DeviceSubscriptions
        setDevices={setDevices}
        deviceInfo={deviceInfo}
        networkID={networkID}
      />

      <ClipboardToasts />
    </>
  );
}

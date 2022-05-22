import { useState } from "react";
import { rest } from "../utils/pusher.server";
import { commitSession, getSession } from "../utils/sessions";
import { MainScreen } from "../components/main-screen";
import { ErrorScreen } from "../components/error-screen";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { getClientIPAddress } from "remix-utils";
import { ClipboardToasts } from "~/components/clipboard-toasts";
import { DeviceSubscriptions } from "~/components/device-subscriptions";
import type { Device } from "~/types";
import { useDevice } from "~/hooks/use-device";
import { useNotifications } from "~/hooks/use-notifications";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const ipAddress =
    process.env.NODE_ENV === "production"
      ? getClientIPAddress(request.headers)
      : "127.0.0.1";

  if (!ipAddress) {
    return json(
      { error: "Internal Server Error" },
      {
        status: 500
      }
    );
  }

  const base64IP = Buffer.from(ipAddress).toString("base64");
  const response = await rest.get({
    path: `/channels/presence-${base64IP}/users`
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
    {
      ip: base64IP,
      allDevices
    },
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
  ip?: string;
  clipboardError?: string;
  error?: string;

  allDevices?: string[];
}

interface ActionData {
  clipboardError?: string;
  lastDeviceName?: string;
}

export default function Index() {
  const { ip, error, allDevices } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const [devices, setDevices] = useState<Device[]>([]);
  const { notifications, setNotifications } = useNotifications();
  const myDevice = useDevice({
    ip,
    allDevices: allDevices ?? [],
    shouldConnect: !!ip
  });

  function getDeviceHalves() {
    const half = Math.ceil(devices.length / 2);
    return {
      first: devices.slice(0, half),
      second: devices.slice(half)
    };
  }

  if (myDevice.isFirefox) {
    return (
      <ErrorScreen>
        <p className="text-red-500 text-lg mt-auto">
          Firefox is not supported. Download Chrome/Edge/Opera/Brave.
        </p>
      </ErrorScreen>
    );
  }

  if (myDevice.isIE) {
    return (
      <ErrorScreen>
        <p className="text-red-500 text-lg mt-auto">
          Internet Explorer is not supported. Download Chrome/Edge/Opera/Brave.
        </p>
      </ErrorScreen>
    );
  }

  if (error || !ip) {
    return (
      <ErrorScreen>
        <p className="text-red-500 text-lg mt-auto">
          Failed to connect, reason:{" "}
          {error ?? "failed to retrieve public IP address"}
        </p>
      </ErrorScreen>
    );
  }

  if (myDevice.isError) {
    return (
      <ErrorScreen>
        <p className="text-red-500 text-lg mt-auto">
          Failed to connect, reason: {myDevice.error || "unknown"}
        </p>
      </ErrorScreen>
    );
  }

  return (
    <>
      <MainScreen
        ip={ip}
        devicesHalves={getDeviceHalves()}
        myDevice={myDevice}
      />

      <ClipboardToasts
        clipboardError={actionData?.clipboardError}
        lastDeviceName={actionData?.lastDeviceName}
      />

      <DeviceSubscriptions
        myDevice={myDevice}
        notifications={notifications}
        setDevices={setDevices}
        setNotifications={setNotifications}
      />
    </>
  );
}

import {
  json,
  MetaFunction,
  useRouteData,
  redirect,
  ActionFunction
} from "remix";
import { useState, useEffect, Fragment } from "react";
import { Device, snakeCase, useDevice } from "../utils/device";
import { rest } from "../utils/pusher.server";
import { useClipboard } from "../utils/clipboard";
import { DiscoveredDevice } from "../components/discovered-device";
import type { ClipboardData, Loader } from "../types";
import toast from "react-hot-toast";
import { InformationCircleIcon } from "@heroicons/react/solid";
import { Dialog, Transition } from "@headlessui/react";

export let meta: MetaFunction = () => {
  return {
    title: "OneClip",
    description: "Share your clipboard from any device, anywhere."
  };
};

export let loader: Loader = async ({ context }) => {
  if (!context.ip) {
    return json(
      { ip: "", notFound: true },
      {
        status: 404
      }
    );
  }

  return { ip: Buffer.from(context.ip).toString("base64") };
};

type PresenceChannel = {
  members: Record<string, Omit<Device, "name">>;
};

type MemberData = {
  id: string;
  info: Omit<Device, "name">;
};

export let action: ActionFunction = async ({ request }) => {
  let body = new URLSearchParams(await request.text());
  let from = body.get("from");
  let deviceChannel = body.get("channel");
  let text = body.get("text");

  if (!deviceChannel) {
    // Handle error
    return redirect("/");
  }

  if (!from) {
    // Handle error
    return redirect("/");
  }

  if (!text) {
    // Handle error
    return redirect("/");
  }

  const response = await rest.trigger(deviceChannel, "copy-to-clipboard", {
    from,
    text
  });

  if (!response.ok) {
    // Handle error
    console.log(response.status);
    return redirect("/");
  }

  return redirect("/");
};

type RouteData = {
  ip: string;
  notFound?: boolean;
};

export default function Index() {
  let { ip, notFound } = useRouteData<RouteData>();
  let [devices, setDevices] = useState<Device[]>([]);
  let myDevice = useDevice({ ip, shouldConnect: !notFound });
  let { copy, text, error } = useClipboard();
  let [show, setShow] = useState(false);

  useEffect(() => {
    if (myDevice.isConnected) {
      setShow(true);
    }
  }, [myDevice.isConnected]);

  useEffect(() => {
    if (error) {
      toast.error(
        "There was an error with your clipboard, make sure you have allowed OneClip to access it and refresh.",
        {
          duration: Infinity,
          style: {
            paddingRight: 0
          }
        }
      );
    }
  }, [error]);

  useEffect(() => {
    if (!myDevice.selfChannel || !myDevice.networkChannel) {
      return;
    }

    myDevice.selfChannel.bind(
      "copy-to-clipboard",
      async ({ from, text }: ClipboardData) => {
        try {
          await copy(text);
          toast.success(
            `Check your clipboard, ${from} just pasted something in it!`,
            {
              duration: 4000,
              style: {
                paddingRight: 0
              }
            }
          );
        } catch (error) {
          toast.error(
            `${from} tried to copy their clipboard in yours but your clipboard isn't working.`,
            {
              style: {
                paddingRight: 0
              }
            }
          );
        }
      }
    );

    myDevice.networkChannel.bind(
      "pusher:subscription_succeeded",
      ({ members }: PresenceChannel) => {
        setDevices(
          Object.keys(members)
            .filter(memberId => memberId !== myDevice?.info?.name)
            .map(memberId => {
              return {
                name: memberId,
                type: members[memberId].type
              };
            })
        );
      }
    );

    myDevice.networkChannel.bind(
      "pusher:member_added",
      (member: MemberData) => {
        setDevices(prevDevices => [
          ...prevDevices,
          { name: member.id, type: member.info.type }
        ]);
      }
    );

    myDevice.networkChannel.bind(
      "pusher:member_removed",
      (member: MemberData) => {
        setDevices(prevDevices =>
          prevDevices.filter(device => device.name !== member.id)
        );
      }
    );
  }, [
    copy,
    myDevice?.info?.name,
    myDevice.networkChannel,
    myDevice.selfChannel
  ]);

  if (notFound) {
    // TODO
    return null;
  }

  return (
    <>
      <Transition.Root show={show} as={Fragment}>
        <Dialog
          as="div"
          auto-reopen="true"
          className="fixed z-10 inset-0 overflow-y-auto"
          onClose={() => setShow(false)}
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
                <div>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <InformationCircleIcon
                      className="h-6 w-6 text-green-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title
                      as="h3"
                      className="text-lg leading-6 font-medium text-gray-900"
                    >
                      Stay on this page
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        If you go to another page or tab, nobody will be able to
                        share their clipboard with you.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6">
                  <button
                    type="button"
                    className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand text-base font-medium text-white hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand sm:text-sm"
                    onClick={() => setShow(false)}
                  >
                    Got it
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      <div className="flex flex-col justify-center items-center min-h-screen p-12 bg-gray-900">
        {myDevice.isConnecting ? (
          <>
            <img
              src="/logo.svg"
              alt="OneClip"
              className="h-14 w-14 mb-3 animate-spin"
            />

            <p className="text-gray-200">Connecting you...</p>
          </>
        ) : myDevice.isConnected && !!myDevice.info ? (
          <>
            <div className="flex mt-auto gap-14 items-center justify-center flex-wrap mb-32">
              {devices.length > 0 ? (
                devices.map(device => (
                  <DiscoveredDevice
                    clipboardText={text}
                    myDeviceName={myDevice.info?.name ?? ""}
                    key={device.name}
                    device={device}
                    channel={`private-${snakeCase(device.name)}-${ip}`}
                  />
                ))
              ) : (
                <p className="text-brand text-xl">
                  Open OneClip on other devices to share your clipboard
                </p>
              )}
            </div>

            <div className="mt-auto flex flex-col items-center text-center">
              <img src="/logo.svg" alt="OneClip" className="h-14 w-14 mb-3" />
              <p className="text-gray-200">
                You are known as {myDevice?.info?.name}
              </p>
              <p className="text-brand text-sm mt-1.5">
                You can be discovered by everyone on this network
              </p>
              {/* <p className="text-sm text-gray-200 mt-1.5">
              Stay focused on this page for OneClip to work
            </p> */}
            </div>
          </>
        ) : (
          <>
            <img src="/logo.svg" alt="OneClip" className="h-14 w-14 mb-3" />

            <p className="text-red-500">
              Failed to connect, reason: {myDevice.error ?? "unknown"}
            </p>
          </>
        )}
      </div>
    </>
  );
}

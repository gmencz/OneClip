import { Dialog, Transition } from "@headlessui/react";
import {
  ExclamationIcon,
  InformationCircleIcon,
  XIcon
} from "@heroicons/react/solid";
import { Fragment, useState } from "react";
import { useNotifications } from "~/hooks/use-notifications";
import { NotificationItem } from "./notification-item";

export function Header() {
  const [showInfo, setShowInfo] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications } = useNotifications();
  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const dismissInfo = () => {
    setShowInfo(false);
  };

  const dismissNotifications = () => {
    setShowNotifications(false);
  };

  return (
    <>
      <div className="flex items-center space-x-6 ml-auto p-4 lg:py-6 lg:px-12 justify-end">
        <button
          onClick={() => setShowNotifications(true)}
          title="Notifications"
          className="relative"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-7 h-7 text-gray-200 hover:text-gray-100"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
          <span className="sr-only">Notifications</span>

          {notifications.length > 0 ? (
            <span className="ring-2 ring-gray-900 absolute -top-0.5 -right-1 w-4 h-4 flex items-center justify-center rounded-full font-bold text-xs bg-brand text-gray-200">
              {notifications.length}
            </span>
          ) : null}
        </button>

        <a href="https://github.com/gmencz/OneClip" title="GitHub">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-gray-200 hover:text-gray-100"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          <span className="sr-only">GitHub</span>
        </a>

        <button title="Info" onClick={() => setShowInfo(true)}>
          <InformationCircleIcon
            className="h-7 w-7 text-gray-200 hover:text-gray-100"
            aria-hidden="true"
          />
          <span className="sr-only">Info</span>
        </button>
      </div>

      <Transition.Root show={showNotifications} as={Fragment}>
        <Dialog
          as="div"
          auto-reopen="true"
          className="fixed inset-0 overflow-hidden"
          onClose={dismissNotifications}
        >
          <div className="absolute inset-0 overflow-hidden">
            <Transition.Child
              as={Fragment}
              enter="ease-in-out duration-500"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in-out duration-500"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="absolute inset-0 bg-gray-700 bg-opacity-75 transition-opacity" />
            </Transition.Child>
            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <div className="relative w-screen max-w-lg">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute top-0 left-0 -ml-8 pt-4 pr-2 flex sm:-ml-10 sm:pr-4">
                      <button
                        className="rounded-md text-gray-300 hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-white"
                        onClick={dismissNotifications}
                      >
                        <span className="sr-only">Close panel</span>
                        <XIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="h-full flex flex-col py-6 bg-gray-900 shadow-xl overflow-y-auto">
                    <div className="px-4 sm:px-6">
                      <Dialog.Title className="text-lg font-medium text-gray-200">
                        Notifications
                      </Dialog.Title>
                    </div>

                    {notifications.length === 0 ? (
                      <div className="mt-6 relative flex-1 px-4 sm:px-6 text-gray-300">
                        <p>You don't have any notifications.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-700 px-4 sm:px-6">
                        <div className="flow-root mt-6">
                          <ul className="-my-5 divide-y divide-gray-700">
                            {sortedNotifications.map(notification => (
                              <NotificationItem
                                key={notification.id}
                                notification={notification}
                              />
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      <Transition.Root show={showInfo} as={Fragment}>
        <Dialog
          as="div"
          auto-reopen="true"
          className="fixed inset-0 overflow-hidden"
          onClose={dismissInfo}
        >
          <div className="absolute inset-0 overflow-hidden">
            <Transition.Child
              as={Fragment}
              enter="ease-in-out duration-500"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in-out duration-500"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="absolute inset-0 bg-gray-700 bg-opacity-75 transition-opacity" />
            </Transition.Child>
            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <div className="relative w-screen max-w-md">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute top-0 left-0 -ml-8 pt-4 pr-2 flex sm:-ml-10 sm:pr-4">
                      <button
                        className="rounded-md text-gray-300 hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-white"
                        onClick={dismissInfo}
                      >
                        <span className="sr-only">Close panel</span>
                        <XIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="h-full flex flex-col py-6 bg-gray-900 shadow-xl overflow-y-auto">
                    <div className="px-4 sm:px-6">
                      <Dialog.Title className="text-lg font-medium text-gray-200">
                        OneClip
                      </Dialog.Title>
                    </div>
                    <div className="mt-6 relative flex-1 px-4 sm:px-6 text-gray-300">
                      <p>
                        OneClip allows you to share your clipboard with nearby
                        devices.
                      </p>

                      <p className="mt-4">
                        All you need to do is open OneClip on your nearby
                        devices and they will be discovered. To share your
                        clipboard with one of the devices, click/tap on the
                        device to which you want to share your clipboard with.
                        If the other device has OneClip open and focused, your
                        clipboard will be pasted into theirs, else, the other
                        device will be notified that you shared your clipboard
                        with them.
                      </p>

                      <p className="mt-4">
                        When we talk about nearby devices, we're referring to
                        devices in the same network.
                      </p>

                      <div className="mt-4 rounded-md bg-gray-800 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <InformationCircleIcon
                              className="h-5 w-5 text-green-400"
                              aria-hidden="true"
                            />
                          </div>
                          <div className="ml-3 flex-1 md:flex md:justify-between">
                            <p className="text-sm text-green-500">
                              The maximum allowed amount of connected devices
                              per network is 100.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 rounded-md bg-gray-800 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <ExclamationIcon
                              className="h-5 w-5 text-yellow-400"
                              aria-hidden="true"
                            />
                          </div>
                          <div className="ml-3 flex-1 md:flex md:justify-between">
                            <p className="text-sm text-yellow-500">
                              We don't recommend using OneClip on public
                              networks since anyone can connect to that network
                              and share their clipboard with you. If you do use
                              it, do so at your own risk.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}

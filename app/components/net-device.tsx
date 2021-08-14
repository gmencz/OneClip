import { useMemo } from "react";
import { Device } from "../utils/device";

type Props = {
  device: Device;
  showRadar?: boolean;
  onClick: () => void;
};

export function NetDevice({ device, showRadar, onClick }: Props) {
  let deviceSvg = useMemo(() => {
    switch (device.type) {
      case "console":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M8 10.5c0 .827-.673 1.5-1.5 1.5s-1.5-.673-1.5-1.5.673-1.5 1.5-1.5 1.5.673 1.5 1.5zm16 6.216c0 1.587-.56 2.591-1.749 3.179-.143.071-.296.105-.449.105-.242 0-.482-.087-.672-.255l-3.109-2.745c-.558-.494-1.044-1.004-2.404-1.004h-7.233c-1.36 0-1.847.51-2.404 1.004l-3.11 2.745c-.188.168-.429.255-.672.255-.152 0-.307-.034-.449-.105-1.189-.588-1.749-1.592-1.749-3.178 0-2.062.945-5.461 2.681-9.857.822-2.083 2.292-2.86 3.695-2.86.656 0 1.298.17 1.853.456 2.424 1.249 5.17 1.223 7.544 0 .553-.286 1.195-.456 1.851-.456 1.403 0 2.874.777 3.696 2.86 1.735 4.395 2.68 7.794 2.68 9.856zm-15-6.216c0-1.381-1.119-2.5-2.5-2.5s-2.5 1.119-2.5 2.5 1.119 2.5 2.5 2.5 2.5-1.119 2.5-2.5zm4-2.5c0-.552-.447-1-1-1s-1 .448-1 1 .447 1 1 1 1-.448 1-1zm3.5 2.5c0-.415-.336-.75-.75-.75s-.75.335-.75.75.336.75.75.75.75-.335.75-.75zm1.75 1.75c0-.415-.336-.75-.75-.75s-.75.335-.75.75.336.75.75.75.75-.335.75-.75zm0-3.531c0-.415-.336-.75-.75-.75s-.75.335-.75.75.336.75.75.75.75-.336.75-.75zm1.734 1.781c0-.415-.336-.75-.75-.75s-.75.335-.75.75.336.75.75.75.75-.335.75-.75z" />
          </svg>
        );
      case "desktop":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "mobile":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M19 2c0-1.104-.896-2-2-2h-10c-1.104 0-2 .896-2 2v20c0 1.104.896 2 2 2h10c1.104 0 2-.896 2-2v-20zm-8.5 0h3c.276 0 .5.224.5.5s-.224.5-.5.5h-3c-.276 0-.5-.224-.5-.5s.224-.5.5-.5zm1.5 20c-.553 0-1-.448-1-1s.447-1 1-1c.552 0 .999.448.999 1s-.447 1-.999 1zm5-3h-10v-14.024h10v14.024z" />
          </svg>
        );
      case "smarttv":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M22 4v12h-20v-12h20zm2-2h-24v16h24v-16zm-17.836 5h5.673v1.418h-2.01v4.582h-1.653v-4.582h-2.01v-1.418zm9.961 0l-1.158 3.653-1.151-3.653h-1.701l1.942 6h1.792l1.986-6h-1.71zm-9.125 13c1 1.194 2.862 2 5 2s4-.806 5-2h-10z" />
          </svg>
        );
      case "tablet":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M19 24c1.104 0 2-.896 2-2v-20c0-1.104-.896-2-2-2h-14c-1.104 0-2 .896-2 2v20c0 1.104.896 2 2 2h14zm-14-3v-18h14v18h-14zm6.5 1.5c0-.276.224-.5.5-.5s.5.224.5.5-.224.5-.5.5-.5-.224-.5-.5z" />
          </svg>
        );
      case "wearable":
      case "unknown":
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  }, [device.type]);

  return (
    <button
      onClick={onClick}
      className="w-[5.35rem] h-[5.35rem] rounded-full bg-brand flex items-center justify-center text-white relative"
    >
      {deviceSvg}
      {showRadar ? (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-25" />
      ) : null}
      <span className="bg-white text-gray-800 text-sm absolute top-[88%] whitespace-nowrap rounded-full py-1 px-2 font-bold">
        {device.name}
      </span>
    </button>
  );
}

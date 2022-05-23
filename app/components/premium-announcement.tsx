import { SpeakerphoneIcon, XIcon } from "@heroicons/react/outline";
import { Link } from "@remix-run/react";

function PremiumAnnouncement() {
  return (
    <div className="bg-brand">
      <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="w-0 flex-1 flex items-center">
            <span className="flex p-2 rounded-lg bg-gray-900">
              <SpeakerphoneIcon
                className="h-6 w-6 text-gray-100"
                aria-hidden="true"
              />
            </span>
            <p className="ml-3 text-gray-900 truncate font-bold">
              <span className="md:hidden">New features!</span>
              <span className="hidden md:inline">
                Big news! Upgrade to Premium free for one month and enjoy new
                features.
              </span>
            </p>
          </div>
          <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
            <Link
              to="/premium"
              className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-100 bg-gray-900 hover:bg-white hover:text-gray-900"
            >
              Learn more
            </Link>
          </div>
          <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
            <button
              type="button"
              className="-mr-1 flex p-2 rounded-md hover:bg-white focus:outline-none focus:ring-2 focus:ring-white sm:-mr-2"
            >
              <span className="sr-only">Dismiss</span>
              <XIcon className="h-6 w-6 text-gray-900" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { PremiumAnnouncement };

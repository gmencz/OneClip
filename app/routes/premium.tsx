import { CheckCircleIcon, CheckIcon } from "@heroicons/react/solid";
import { Link } from "@remix-run/react";

const features = [
  "File sharing.",
  "Your own networks to share with anyone anywhere."
];

export default function Pricing() {
  return (
    <div className="bg-gray-900 h-full">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 h-full flex flex-col">
        <header>
          <Link to="/">
            <img src="/logo.svg" alt="OneClip" className="h-12 w-12 mb-12" />
          </Link>
        </header>

        <div className="my-auto">
          <div className="pb-16 xl:flex xl:items-center xl:justify-between">
            <div>
              <h1 className="text-4xl font-extrabold sm:text-5xl sm:tracking-tight">
                <span className="text-gray-100">Try Premium </span>
                <span className="text-brand">free for one month</span>
              </h1>
              <p className="mt-5 text-xl text-gray-300">
                After that, $9.99 per month. Cancel anytime.
              </p>
            </div>
            <a
              href="/"
              className="mt-8 w-full bg-brand border border-transparent px-5 py-3 inline-flex items-center justify-center text-base rounded-md text-gray-900 font-bold hover:bg-indigo-700 sm:mt-10 sm:w-auto xl:mt-0"
            >
              Get started today
            </a>
          </div>
          <div className="border-t border-gray-700 pt-12">
            <h2 className="text-base font-semibold text-brand tracking-wide uppercase">
              Why Premium?
            </h2>
            <div className="mt-4 sm:mt-8 md:grid md:grid-cols-2 md:gap-x-8 xl:col-span-2">
              <ul className="divide-y divide-gray-700">
                {features.slice(0, 5).map((feature, featureIdx) =>
                  featureIdx === 0 ? (
                    <li key={feature} className="py-4 flex md:py-0 md:pb-4">
                      <CheckIcon
                        className="flex-shrink-0 h-6 w-6 text-green-500"
                        aria-hidden="true"
                      />
                      <span className="ml-3 text-base text-gray-500">
                        {feature}
                      </span>
                    </li>
                  ) : (
                    <li key={feature} className="py-4 flex">
                      <CheckIcon
                        className="flex-shrink-0 h-6 w-6 text-green-500"
                        aria-hidden="true"
                      />
                      <span className="ml-3 text-base text-gray-500">
                        {feature}
                      </span>
                    </li>
                  )
                )}
              </ul>
              <ul className="border-t border-gray-200 divide-y divide-gray-200 md:border-t-0">
                {features.slice(5).map((feature, featureIdx) =>
                  featureIdx === 0 ? (
                    <li
                      key={feature}
                      className="py-4 flex md:border-t-0 md:py-0 md:pb-4"
                    >
                      <CheckIcon
                        className="flex-shrink-0 h-6 w-6 text-green-500"
                        aria-hidden="true"
                      />
                      <span className="ml-3 text-base text-gray-500">
                        {feature}
                      </span>
                    </li>
                  ) : (
                    <li key={feature} className="py-4 flex">
                      <CheckIcon
                        className="flex-shrink-0 h-6 w-6 text-green-500"
                        aria-hidden="true"
                      />
                      <span className="ml-3 text-base text-gray-500">
                        {feature}
                      </span>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { LinksFunction, useRouteData } from "remix";
import { Meta, Links, Scripts, LiveReload } from "remix";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import styles from "./styles/app.css";
import { Loader, Env } from "./types";
import { getEnv } from "./utils/env";
import { ErrorScreen } from "./components/error-screen";

type RouteData = {
  env: Env;
};

declare global {
  let env: Env;

  namespace NodeJS {
    interface Global {
      env: Env;
    }
  }

  interface Window {
    env: Env;
  }
}

export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export let loader: Loader = () => {
  let data = {
    env: getEnv()
  };

  return data;
};

function EnvScript({ env }: { env: Env }) {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.env = ${JSON.stringify(env)}`
      }}
    />
  );
}

function Document({ children }: { children: React.ReactNode }) {
  let data = useRouteData<RouteData>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}

        <Scripts />
        <EnvScript env={data.env} />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Document>
      <Outlet />
      <Toaster />
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Document>
      <ErrorScreen>
        <p className="text-red-500 text-xl mt-auto">
          Unexpected error: {error.message}
        </p>
      </ErrorScreen>
    </Document>
  );
}

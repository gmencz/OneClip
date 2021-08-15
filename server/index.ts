import path from "path";
import express from "express";
import compression from "compression";
import morgan from "morgan";
import helmet from "helmet";
import { createRequestHandler } from "@remix-run/express";
import { getLoadContext } from "./context";
import { handlePusherAuth } from "./handlers/pusher-auth";

const MODE = process.env.NODE_ENV;
const BUILD_DIR = path.join(process.cwd(), "server/build");

let app = express();

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

app.use(compression());

app.use(morgan("tiny"));

if (MODE === "production") {
  app.use((req, res, next) => {
    if (req.get("X-Forwarded-Proto") == "http") {
      // request was via http, so redirect to https
      res.redirect("https://" + req.headers.host + req.url);
    } else {
      next();
    }
  });
}

// You may want to be more aggressive with this caching
app.use(express.static("public", { maxAge: "1h" }));

// Remix fingerprints its assets so we can cache forever
app.use(express.static("public/build", { immutable: true, maxAge: "1y" }));

app.post(
  "/pusher/auth",
  express.json(),
  express.urlencoded({ extended: false }),
  handlePusherAuth
);

app.all(
  "*",
  MODE === "production"
    ? createRequestHandler({
        build: require("../../build"),
        getLoadContext
      })
    : (req, res, next) => {
        purgeRequireCache();
        let build = require("./build");
        return createRequestHandler({
          build,
          mode: MODE,
          getLoadContext
        })(req, res, next);
      }
);

let port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});

////////////////////////////////////////////////////////////////////////////////
function purgeRequireCache() {
  // purge require cache on requests for "server side HMR" this won't let
  // you have in-memory objects between requests in development,
  // alternatively you can set up nodemon/pm2-dev to restart the server on
  // file changes, we prefer the DX of this though, so we've included it
  // for you by default
  for (let key in require.cache) {
    if (key.startsWith(BUILD_DIR)) {
      delete require.cache[key];
    }
  }
}

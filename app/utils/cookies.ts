import { createCookie } from "remix";

let TEN_YEARS = 315360000;

let deviceCookie = createCookie("device", {
  maxAge: TEN_YEARS
});

export { TEN_YEARS, deviceCookie };

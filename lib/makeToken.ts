import { randomBytes } from "crypto";

export const makeToken = (bytes = 24) =>
  randomBytes(bytes).toString("base64url"); // URL-safe

import { RetryError } from "std/async/retry.ts";

export default function isRetryError(error: unknown): error is RetryError {
  return typeof error === "object" && error !== null && "name" in error && error.name === "RetryError";
}

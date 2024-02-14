import { IAxiodError } from "axiod/interfaces.ts";

export default function isAxiodError(value: unknown): value is IAxiodError {
  return typeof value === "object" && value !== null && "response" in value;
}

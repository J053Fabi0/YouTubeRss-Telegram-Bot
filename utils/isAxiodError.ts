import { IAxiodError } from "https://deno.land/x/axiod@0.26.2/interfaces.ts";

export default function isAxiodError(value: unknown): value is IAxiodError {
  return typeof value === "object" && value !== null && "response" in value;
}

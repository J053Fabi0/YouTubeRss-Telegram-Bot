export default function isError(e: unknown): e is Error {
  return e instanceof Error;
}

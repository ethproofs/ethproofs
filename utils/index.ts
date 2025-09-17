export function isFunction(value: unknown): value is () => void {
  return typeof value === "function"
}

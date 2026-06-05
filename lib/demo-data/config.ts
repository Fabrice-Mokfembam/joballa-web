/** When true, portal APIs return in-memory demo fixtures instead of calling the backend. */
export function isDemoDataEnabled(): boolean {
  const flag = process.env.NEXT_PUBLIC_USE_DEMO_DATA;
  if (flag === "true") return true;
  if (flag === "false") return false;
  return process.env.NODE_ENV === "development";
}

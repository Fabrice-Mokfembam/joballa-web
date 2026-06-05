import { isDemoDataEnabled } from "@/lib/demo-data/config";

export function withDemo<T>(live: () => Promise<T>, demo: () => Promise<T>): Promise<T> {
  return isDemoDataEnabled() ? demo() : live();
}

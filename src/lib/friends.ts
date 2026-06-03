import { friends as generatedFriends } from "@/data/generated";
import type { Friend } from "@/types";

export function getFriends(): Friend[] {
  return generatedFriends;
}

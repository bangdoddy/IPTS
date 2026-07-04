import { useMemo } from "react";
import { getCookieJson } from "../libs/cookie";

export type AuthCookie = {
  actorType?: string; // REVIEWER | SUPERIOR | ...
  actortype?: string; // some backends use this casing
  name?: string;
  [k: string]: any;
};

export function useAuthCookie() {
  return useMemo(() => {
    const keys = ["inovasis_auth", "auth", "user", "session"] as const;

    let foundKey: string | null = null;
    let foundVal: AuthCookie | null = null;

    for (const k of keys) {
      const v = getCookieJson<AuthCookie>(k);
      if (v) {
        foundKey = k;
        foundVal = v;
        break;
      }
    }

    const rawActorType = (foundVal?.actorType ?? foundVal?.actortype ?? "").toString();
    const actorType = rawActorType.toUpperCase();

    const canAccessApproval = actorType === "REVIEWER" || actorType === "SUPERIOR";

    return {
      key: foundKey,
      cookie: foundVal,
      actorType,
      canAccessApproval,
      userName: foundVal?.name,
    };
  }, []);
}

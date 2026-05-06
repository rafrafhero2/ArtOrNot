import { useEffect, useState } from "react";
import { ensureAuth } from "@/lib/firebase";

export function useUID() {
  const [uid, setUid] = useState<string | null>(null);
  useEffect(() => { ensureAuth().then((u) => setUid(u.uid)); }, []);
  return uid;
}

"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import supabase from "@/lib/supabaseClient";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!isMounted) return;
      if (!session) {
        router.replace(
          `/login?redirect=${encodeURIComponent(pathname || "/")}`
        );
      } else {
        setChecked(true);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [pathname]);

  if (!checked) {
    return null;
  }
  return <>{children}</>;
}

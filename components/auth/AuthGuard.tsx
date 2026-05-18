"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

const AUTH_ROUTES = ["/login", "/register"];

/** Only same-origin relative paths are allowed as a post-auth redirect. */
function safeNext(raw: string | null): string {
  if (!raw) return "/dashboard";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const isProtectedRoute =
      pathname.startsWith("/dashboard") || pathname.startsWith("/team");
    const isAuthRoute = AUTH_ROUTES.includes(pathname);

    if (isProtectedRoute && !isAuthenticated) {
      // Preserve where they were heading so login can return them.
      const here = pathname + (search.toString() ? `?${search.toString()}` : "");
      router.replace(`/login?next=${encodeURIComponent(here)}`);
    } else if (isAuthRoute && isAuthenticated) {
      router.replace(safeNext(search.get("next")));
    }
  }, [hydrated, isAuthenticated, pathname, search, router]);

  if (
    !hydrated &&
    (pathname.startsWith("/dashboard") || pathname.startsWith("/team"))
  ) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-paper">
        <Loader2 className="h-5 w-5 animate-spin text-claret" />
      </div>
    );
  }

  return <>{children}</>;
}

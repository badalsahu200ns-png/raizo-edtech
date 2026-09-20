"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SignupRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const redirectParam = searchParams.get("redirect");
    const target = redirectParam
      ? `/login?redirect=${encodeURIComponent(redirectParam)}`
      : "/login";
    router.replace(target);
  }, [router, searchParams]);

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center text-center space-y-4">
      <div className="h-10 w-10 border-2 border-[#0EA5E9] border-t-transparent rounded-full animate-spin" />
      <p className="text-xs text-[#A7B0BC]">Redirecting to RAIZO Sign In...</p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-10 w-10 border-2 border-[#0EA5E9] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#A7B0BC]">Redirecting to RAIZO Sign In...</p>
        </div>
      }
    >
      <SignupRedirect />
    </Suspense>
  );
}

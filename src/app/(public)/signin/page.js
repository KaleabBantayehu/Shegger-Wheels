import { Suspense } from "react";
import SignInForm from "@/components/SignInForm";
import { safeReturnPath } from "@/lib/auth";

export const metadata = {
  title: "Demo Sign In | Sheggar Wheels",
  description: "Sign in to Sheggar Wheels.",
};

async function SignInContent({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const rawNext = Array.isArray(resolvedSearchParams?.next)
    ? resolvedSearchParams.next[0]
    : resolvedSearchParams?.next;

  return <SignInForm nextPath={safeReturnPath(rawNext)} />;
}

export default function SignInPage({ searchParams }) {
  return (
    <Suspense
      fallback={
        <div className="bg-[#0b1320] min-h-screen flex items-center justify-center px-4">
          <p role="status" className="text-sm text-gray-400">
            Loading demo sign-in…
          </p>
        </div>
      }
    >
      <SignInContent searchParams={searchParams} />
    </Suspense>
  );
}

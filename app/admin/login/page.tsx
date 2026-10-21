"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Btn } from "@/components/admin/ui";
import { SignInForm } from "@/components/admin/SignInForm";

export default function AdminLoginPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-8">
      <div className="w-full max-w-sm space-y-5">
        <div className="space-y-2 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-circle.webp" alt="Cherryl Media" width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
            <span className="text-base font-semibold tracking-wide text-white">Cherryl Newsroom</span>
          </Link>
          <h1 className="text-xl font-semibold text-white">Sign in</h1>
          <p className="text-sm text-zinc-400">Manage leads, write stories and publish.</p>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#16181D] p-5">
          <SignInForm autoFocus onSignedIn={() => router.push("/admin")} />
        </div>

        <div className="flex justify-center">
          <Btn href="/" variant="ghost" size="sm" arrow="back">
            Back to site
          </Btn>
        </div>
      </div>
    </div>
  );
}

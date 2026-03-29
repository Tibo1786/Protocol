"use client";

import { useRouter } from "next/navigation";
import { signOut, useActiveOrganization } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function NavBar() {
  const router = useRouter();
  const { data: org } = useActiveOrganization();

  async function handleSignOut() {
    await signOut({
      fetchOptions: {
        onSuccess: () => router.push("/sign-in"),
      },
    });
  }

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <span className="font-semibold">Rules Register</span>
        <div className="flex items-center gap-4">
          {org && (
            <span className="text-sm text-muted-foreground">{org.name}</span>
          )}
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}

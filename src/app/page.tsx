import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";

export async function HomePage() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (session?.session.activeOrganizationId) {
      redirect("/rules");
    }
  } catch {
    // No valid session — render landing page
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <span className="font-semibold tracking-tight">Protocolify</span>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign in
            </Link>
            <Link href="/sign-up" className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 py-24 text-center">
        <p className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-widest">
          Rules Register
        </p>
        <h1 className="text-5xl font-bold tracking-tight leading-tight">
          Business rules as code.
          <br />
          Decisions in real time.
        </h1>
        <p className="mt-6 mx-auto max-w-xl text-lg text-muted-foreground">
          Define your business logic in YAML. Evaluate any JSON payload against
          your rules instantly via API. Built for compliance teams and ops
          managers.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/sign-up" className="inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80">
            Get started free
          </Link>
          <Link href="/sign-in" className="inline-flex h-10 items-center rounded-lg border border-border px-5 text-sm font-medium transition-colors hover:bg-muted">
            Sign in
          </Link>
        </div>
      </section>

      {/* Code example */}
      <section className="border-y bg-muted/40">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-widest">
                Define a rule
              </p>
              <pre className="rounded-lg border bg-background p-5 text-sm leading-relaxed overflow-x-auto">
                <code>{`match: all
conditions:
  - field: transaction.amount
    operator: gt
    value: 10000
  - field: user.country
    operator: in
    value: [US, CA, GB]
action: flag_for_review`}</code>
              </pre>
            </div>
            <div>
              <p className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-widest">
                Evaluate via API
              </p>
              <pre className="rounded-lg border bg-background p-5 text-sm leading-relaxed overflow-x-auto">
                <code>{`POST /api/evaluate

{
  "payload": {
    "transaction.amount": 15000,
    "user.country": "US"
  }
}

→ { "matched": true,
    "action": "flag_for_review" }`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 py-20">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="mb-3 text-sm font-semibold">YAML rules</div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Write rules in human-readable YAML. Support for{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">eq</code>,{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">gt</code>,{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">in</code>,{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">contains</code>{" "}
              and more. AND / OR logic. Dot-notation field paths.
            </p>
          </div>
          <div>
            <div className="mb-3 text-sm font-semibold">Evaluation API</div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              POST any JSON payload to <code className="text-xs bg-muted px-1 py-0.5 rounded">/api/evaluate</code>.
              Get back matched rules, triggered actions, and conditions — in milliseconds.
            </p>
          </div>
          <div>
            <div className="mb-3 text-sm font-semibold">Multi-tenant</div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Each organisation manages its own rule set in complete isolation.
              Role-based access, row-level security, and session-scoped API keys.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto flex h-12 max-w-5xl items-center justify-center px-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Protocolify
          </p>
        </div>
      </footer>
    </div>
  );
}

export { HomePage as default };

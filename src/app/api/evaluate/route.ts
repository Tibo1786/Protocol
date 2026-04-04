import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { evaluateRules } from "@/lib/engine";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const evaluateSchema = z.object({
  payload: z.record(z.string(), z.unknown()),
  rule_ids: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const organizationId = session.session.activeOrganizationId;
  if (!organizationId) {
    return NextResponse.json(
      { error: "No active organisation" },
      { status: 400 },
    );
  }

  const body = await request.json();
  const parsed = evaluateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const where: Record<string, unknown> = {
    organizationId,
    enabled: true,
  };

  if (parsed.data.rule_ids) {
    where.id = { in: parsed.data.rule_ids };
  }

  const rules = await prisma.rule.findMany({
    where,
    select: { id: true, yaml: true, priority: true },
  });

  const results = evaluateRules(rules, parsed.data.payload);

  return NextResponse.json({ results });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { parseRule } from "@/lib/engine";

const createRuleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  yaml: z.string().min(1),
  priority: z.number().int().default(0),
});

async function getOrgFromSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "Unauthorized" as const, organisationId: null };
  }

  const organisationId = session.session.activeOrganizationId;
  if (!organisationId) {
    return { error: "No active organisation" as const, organisationId: null };
  }

  return { error: null, organisationId };
}

export async function GET() {
  const { error, organisationId } = await getOrgFromSession();
  if (error) {
    const status = error === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error }, { status });
  }

  const rules = await prisma.rule.findMany({
    where: { organisationId },
    orderBy: { priority: "desc" },
  });

  return NextResponse.json({ rules });
}

export async function POST(request: NextRequest) {
  const { error, organisationId } = await getOrgFromSession();
  if (error) {
    const status = error === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error }, { status });
  }

  const body = await request.json();
  const parsed = createRuleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Validate YAML parses to a valid rule
  try {
    parseRule(parsed.data.yaml);
  } catch (e) {
    return NextResponse.json(
      { error: "Invalid rule YAML", details: (e as Error).message },
      { status: 422 },
    );
  }

  const rule = await prisma.rule.create({
    data: {
      ...parsed.data,
      organisationId,
    },
  });

  return NextResponse.json({ rule }, { status: 201 });
}

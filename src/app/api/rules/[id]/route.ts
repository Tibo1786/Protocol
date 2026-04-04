import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { parseRule } from "@/lib/engine";

async function getOrgAndRule(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "Unauthorized" as const, organizationId: null, rule: null };
  }

  const organizationId = session.session.activeOrganizationId;
  if (!organizationId) {
    return { error: "No active organisation" as const, organizationId: null, rule: null };
  }

  const rule = await prisma.rule.findFirst({
    where: { id, organizationId },
  });

  if (!rule) {
    return { error: "Not found" as const, organizationId, rule: null };
  }

  return { error: null, organizationId, rule };
}

const updateRuleSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  yaml: z.string().min(1).optional(),
  priority: z.number().int().optional(),
  enabled: z.boolean().optional(),
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error, rule } = await getOrgAndRule(id);

  if (error) {
    const status = error === "Unauthorized" ? 401 : error === "Not found" ? 404 : 400;
    return NextResponse.json({ error }, { status });
  }

  return NextResponse.json({ rule });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await getOrgAndRule(id);

  if (error) {
    const status = error === "Unauthorized" ? 401 : error === "Not found" ? 404 : 400;
    return NextResponse.json({ error }, { status });
  }

  const body = await request.json();
  const parsed = updateRuleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (parsed.data.yaml) {
    try {
      parseRule(parsed.data.yaml);
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid rule YAML", details: (e as Error).message },
        { status: 422 },
      );
    }
  }

  const rule = await prisma.rule.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ rule });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await getOrgAndRule(id);

  if (error) {
    const status = error === "Unauthorized" ? 401 : error === "Not found" ? 404 : 400;
    return NextResponse.json({ error }, { status });
  }

  await prisma.rule.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}

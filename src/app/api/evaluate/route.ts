import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { parseRule, evaluateRule } from "@/lib/engine";

const EvaluateBodySchema = z.object({
  rule_id: z.string().min(1),
  payload: z.record(z.unknown()),
});

export async function POST(req: NextRequest) {
  let authCtx;
  try {
    authCtx = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = EvaluateBodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const rule = await prisma.rule.findFirst({
    where: {
      id: body.rule_id,
      organisationId: authCtx.organisationId, // RLS enforced at DB level too
      status: "ACTIVE",
    },
  });

  if (!rule) {
    return NextResponse.json({ error: "Rule not found" }, { status: 404 });
  }

  let parsed;
  try {
    parsed = parseRule(rule.yaml);
  } catch (err) {
    return NextResponse.json(
      { error: "Rule configuration error", detail: String(err) },
      { status: 422 }
    );
  }

  const result = evaluateRule(parsed, rule.id, body.payload);

  // Persist evaluation log (fire and forget — don't block response)
  prisma.evaluationLog
    .create({
      data: {
        organisationId: authCtx.organisationId,
        ruleId: rule.id,
        payload: body.payload,
        matched: result.matched,
        action: result.action ?? undefined,
        conditions: result.conditions,
      },
    })
    .catch(() => {});

  return NextResponse.json(result);
}

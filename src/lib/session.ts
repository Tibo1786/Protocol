import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type AuthContext = {
  userId: string;
  organisationId: string;
  role: string;
};

/**
 * Validates the session and resolves the active organisation from auth claims.
 * Never trusts a client-supplied organisation_id.
 * Throws if the user is not authenticated or has no active org membership.
 */
export async function requireAuth(orgSlug?: string): Promise<AuthContext> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const memberWhere = orgSlug
    ? { user: { id: session.user.id }, organisation: { slug: orgSlug } }
    : { userId: session.user.id };

  const member = await prisma.orgMember.findFirst({
    where: memberWhere,
    include: { organisation: true },
    orderBy: { createdAt: "asc" },
  });

  if (!member) {
    throw new Error("No organisation membership found");
  }

  return {
    userId: session.user.id,
    organisationId: member.organisationId,
    role: member.role,
  };
}

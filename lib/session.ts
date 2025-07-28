import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Insufficient permissions");
  }
  return user;
}

export async function requireTeam(teamId: string) {
  const user = await requireAuth();
  const hasTeamAccess = user.teams.some(team => team.id === teamId);
  if (!hasTeamAccess) {
    throw new Error("Team access required");
  }
  return user;
}
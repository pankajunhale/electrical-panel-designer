import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/schema/auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Validate the input
        const validatedFields = loginSchema.safeParse({
          email: credentials.email,
          password: credentials.password,
        });

        if (!validatedFields.success) {
          return null;
        }

        const { email, password } = validatedFields.data;

        try {
          // Find user in database
          const user = await prisma.user.findUnique({
            where: { email },
            include: {
              role: true,
              userTeams: {
                include: {
                  team: true,
                },
              },
            },
          });

          if (!user || user.deletedAt) {
            return null;
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            password,
            user.passwordHash
          );

          if (!isPasswordValid) {
            return null;
          }

          // Return user object that will be stored in the JWT
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role.name,
            teams: user.userTeams.map((ut) => ({
              id: ut.team.id,
              name: ut.team.name,
            })),
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      // When user signs in, add additional data to token
      if (user) {
        token.role = user.role;
        token.teams = user.teams;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.teams = token.teams as Array<{ id: string; name: string }>;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

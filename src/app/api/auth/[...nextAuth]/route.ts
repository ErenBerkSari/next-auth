import NextAuth, { NextAuthOptions } from "next-auth";
import Auth0Provider from "next-auth/providers/auth0";

export const authOptions: NextAuthOptions = {
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      issuer: process.env.AUTH0_ISSUER_BASE_URL,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }: any) {
      // Auth0'dan gelen bilgileri JWT'ye ekle
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      if (profile) {
        token.sub = profile.sub;
        token.name = profile.name;
        token.email = profile.email;
        token.picture = profile.picture;
      }
      return token;
    },
    async session({ session, token }: any) {
      // JWT'den session'a bilgileri aktar
      session.accessToken = token.accessToken;
      session.user.id = token.sub;
      return session;
    },
  },
  session: {
    strategy: "jwt" as const,
  },
 
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 
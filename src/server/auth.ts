import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSideProps, type GetServerSidePropsResult, type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { compare, hash } from "bcrypt";
import { prisma } from "~/server/db";
import { loginSchema } from "~/schemas/loginSchema";
import CredentialsProvider from "next-auth/providers/credentials"
import { signupSchema } from "~/schemas/signupSchema";
import { TRPCClientError } from "@trpc/client";
import { env } from "process";
/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      subscriptionPlan?: string
    };
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    jwt({ token, user }) {
      // Check if the user object exists before assigning its properties to the token
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    // Include user.id on session
    async session({ session, token }) {
      // Check if session.user and token.id exist before assigning
      if (session.user && token.id) {
        session.user.id = token.id as string;
        const user = await prisma.user.findFirst({
          where: {
            id: session.user.id
          },
          select: {
            subscriptionPlan: true
          }
        })
        if (user) {
          session.user.subscriptionPlan = user.subscriptionPlan
          // Include any needed param here 
        }
      }
      return session;
    }

  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      type: 'credentials',
      credentials: {
        // username: { label: "Username", type: "text", placeholder: "jsmith" },
        // password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = loginSchema.parse(credentials)
        const userLogin = await prisma.userLogin.findUnique({
          where: {
            email: email.toLowerCase()
          },
          select: {
            user: true,
            passwordHash: true
          }
        })

        if (!userLogin) {
          if (!signupSchema.safeParse(credentials).success)
            throw new Error('Credentials did not match. Try again.')

          const userCreate = await prisma.userLogin.create({
            data: {
              email,
              passwordHash: await hash(password, 12),
              user: {
                connectOrCreate: {
                  where: {
                    email,
                  },
                  create: {
                    email: email.toLowerCase(),
                    name: email.substring(0, email.indexOf('@')),
                  },
                },
              },
            },
            include: {
              user: true,
            },
          })

          return userCreate.user
        }

        const isValid = await compare(password, userLogin.passwordHash)

        if (!isValid) {
          throw new TRPCClientError('Wrong credentials. Try again.')
        }
        return userLogin.user
      },
    }
    )
  ],
  secret: env.NEXTAUTH_SECRET,
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};



type SubscriptionOptions = {
  requireProSubscription?: boolean;
  requirePremiumSubscription?: boolean;
}
/**
 * Automatic redirect to protect routes on session
 */
export function getServerSideProtectedRoute(options: SubscriptionOptions): GetServerSideProps {
  return async (ctx): Promise<GetServerSidePropsResult<any>> => {
    const session = await getServerAuthSession(ctx);

    if (!session) {
      return {
        props: {},
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    // Check for Pro or Premium subscription access if required
    if (options.requireProSubscription && !['pro', 'premium'].includes(String(session.user?.subscriptionPlan))) {
      return {
        props: {},
        redirect: {
          destination: '/app/contratar',
          permanent: false,
        },
      };
    }

    // Check for Premium subscription access if required
    if (options.requirePremiumSubscription && session.user?.subscriptionPlan !== 'premium') {
      return {
        props: {},
        redirect: {
          destination: '/app/contratar',
          permanent: false,
        },
      };
    }

    return { props: {} };
  };
}
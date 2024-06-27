import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { randomBytes } from "crypto";
import { sendPasswordResetEmail } from "~/utils/email";
import { compare, hash } from "bcrypt";

export const accountRouter = createTRPCRouter({
    initiatePasswordRecovery: publicProcedure
        .input(z.object({ email: z.string().email() }))
        .mutation(async ({ ctx, input }) => {
            const user = await ctx.prisma.user.findUnique({
                where: { email: input.email },
                include: { UserLogin: true },
            });

            if (!user || !user.UserLogin) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "No account found with this email",
                });
            }

            const resetToken = randomBytes(32).toString("hex");
            const resetTokenExpiry = new Date(Date.now() + 900000); // 15 min from now

            // Save the reset token and expiry to the database
            await ctx.prisma.userLogin.update({
                where: { id: user.UserLogin.id },
                data: {
                    resetToken,
                    resetTokenExpiry,
                },
            });

            // Send password reset email
            await sendPasswordResetEmail(String(user.email), resetToken);

            return { message: "Password reset email sent" };
        }),

    resetPassword: publicProcedure
        .input(z.object({
            token: z.string(),
            newPassword: z.string().min(8),
        }))
        .mutation(async ({ ctx, input }) => {
            const userLogin = await ctx.prisma.userLogin.findFirst({
                where: {
                    resetToken: input.token,
                    resetTokenExpiry: { gt: new Date() },
                },
            });

            if (!userLogin) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Invalid or expired reset token",
                });
            }

            const hashedPassword = await hash(input.newPassword, 12);

            await ctx.prisma.userLogin.update({
                where: { id: userLogin.id },
                data: {
                    passwordHash: hashedPassword,
                    resetToken: null,
                    resetTokenExpiry: null,
                },
            });

            return { message: "Password reset successful" };
        }),
});
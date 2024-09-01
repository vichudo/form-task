import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const smsRouter = createTRPCRouter({
    getTotalContacts: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.prisma.formData.count({ where: { userId: ctx.session.user.id } })
    }),
    createRequest: protectedProcedure
        .input(z.object({
            message: z.string().min(1).max(160), // SMS typically have a 160 character limit
            contactsQty: z.number().int().positive(),
            price: z.number().int().positive(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { message, contactsQty, price } = input;
            const userId = ctx.session.user.id;

            try {
                const newRequest = await ctx.prisma.smsRequests.create({
                    data: {
                        message,
                        contactsQty,
                        price,
                        status: "pending",
                        requestUser: { connect: { id: userId } },
                    }
                });

                return newRequest;
            } catch (error) {
                console.error("Error creating SMS request:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "An error occurred while creating the SMS request.",
                });
            }
        }),

    getUserRequests: protectedProcedure
        .query(async ({ ctx }) => {
            const userId = ctx.session.user.id;

            try {
                const requests = await ctx.prisma.smsRequests.findMany({
                    where: { requestUserId: userId },
                    orderBy: { createdAt: 'desc' },
                });

                return requests;
            } catch (error) {
                console.error("Error fetching user SMS requests:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "An error occurred while fetching SMS requests.",
                });
            }
        }),

    cancelRequest: protectedProcedure
        .input(z.object({
            requestId: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { requestId } = input;
            const userId = ctx.session.user.id;

            try {
                const updatedRequest = await ctx.prisma.smsRequests.updateMany({
                    where: {
                        id: requestId,
                        requestUserId: userId,
                        status: "pending",
                    },
                    data: {
                        status: "cancelled",
                    },
                });

                if (updatedRequest.count === 0) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "SMS request not found or already processed.",
                    });
                }

                return { success: true, message: "SMS request cancelled successfully." };
            } catch (error) {
                console.error("Error cancelling SMS request:", error);
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "An error occurred while cancelling the SMS request.",
                });
            }
        }),
});
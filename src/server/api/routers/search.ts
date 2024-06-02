import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const searchRouter = createTRPCRouter({
    searchByRut: publicProcedure
        .input(z.object({
            rut: z.string(),
            useContains: z.boolean().optional().default(false)
        }))
        .query(async ({ ctx, input }) => {
            const { rut, useContains } = input;
            const cleanedRut = rut.replace(/\./g, "").replace(/-/g, "").trim();

            // Determine the search method based on useContains flag
            const searchMethod = useContains ? { contains: cleanedRut } : { startsWith: cleanedRut };

            return await ctx.prisma.padronData.findMany({
                where: {
                    RUN: searchMethod
                },
            });
        }),
});

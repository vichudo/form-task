import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const formRouter = createTRPCRouter({
    submitForm: publicProcedure
        .input(
            z.object({
                rut: z.string().optional(),
                nombre_completo: z.string().optional(),
                telefono: z.string().optional(),
                direccion: z.string().optional(),
                comuna: z.string().optional(),
                region: z.string().optional(),
                nacionalidad: z.string().optional(),
                mail: z.string().optional(),
                instagram: z.string().optional(),
                facebook: z.string().optional(),
                twitter: z.string().optional(),
                etiqueta_1: z.string().optional(),
                etiqueta_2: z.string().optional(),
                etiqueta_3: z.string().optional(),
                comentario: z.string().optional(),
                workspaceId: z.string().optional(),
                userId: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {

            // const workspace = await ctx.prisma.workspace.findFirst({
            //     where: {
            //         users: {
            //             some: {
            //                 id: ctx.session?.user.id
            //             }
            //         }
            //     },
            //     select: {
            //         id: true
            //     }
            // })


            const formData = await ctx.prisma.formData.create({
                data: {
                    ...input,
                    userId: ctx.session?.user.id
                },
            });


            // if (!workspace) {
            //     await ctx.prisma.workspace.create({
            //         data: {
            //             FormData: {
            //                 create: {
            //                     ...formData,
            //                     userId: ctx.session?.user.id
            //                 }
            //             }
            //         }
            //     })
            // }

            return formData;
        }),
    retrieveContacts: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.prisma.formData.findMany({
            where: {
                userId: ctx.session.user.id
            }
        })
    }),
    deleteContactById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return await ctx.prisma.formData.delete({
                where: {
                    id: input.id
                }
            })
        })
});
import { z } from "zod";
import ExcelJS from 'exceljs';
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
    exportContactsToExcel: protectedProcedure.mutation(async ({ ctx }) => {
        // TODO: Include in a smart way padron data in the excel
        const contacts = await ctx.prisma.formData.findMany({
            where: {
                userId: ctx.session.user.id
            }
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Contacts');

        worksheet.columns = [
            { header: 'RUT', key: 'rut', width: 20 },
            { header: 'Nombre Completo', key: 'nombre_completo', width: 30 },
            { header: 'Teléfono', key: 'telefono', width: 20 },
            { header: 'Dirección', key: 'direccion', width: 30 },
            { header: 'Comuna', key: 'comuna', width: 20 },
            { header: 'Región', key: 'region', width: 20 },
            { header: 'Nacionalidad', key: 'nacionalidad', width: 20 },
            { header: 'Email', key: 'mail', width: 30 },
            { header: 'Instagram', key: 'instagram', width: 20 },
            { header: 'Facebook', key: 'facebook', width: 20 },
            { header: 'Twitter', key: 'twitter', width: 20 },
            { header: 'Etiqueta 1', key: 'etiqueta_1', width: 20 },
            { header: 'Etiqueta 2', key: 'etiqueta_2', width: 20 },
            { header: 'Etiqueta 3', key: 'etiqueta_3', width: 20 },
            { header: 'Comentario', key: 'comentario', width: 30 },
        ];

        contacts.forEach(contact => {
            worksheet.addRow({
                rut: contact.rut,
                nombre_completo: contact.nombre_completo,
                telefono: contact.telefono,
                direccion: contact.direccion,
                comuna: contact.comuna,
                region: contact.region,
                nacionalidad: contact.nacionalidad,
                mail: contact.mail,
                instagram: contact.instagram,
                facebook: contact.facebook,
                twitter: contact.twitter,
                etiqueta_1: contact.etiqueta_1,
                etiqueta_2: contact.etiqueta_2,
                etiqueta_3: contact.etiqueta_3,
                comentario: contact.comentario,
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const base64String = Buffer.from(buffer).toString('base64');
        return { base64String };
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
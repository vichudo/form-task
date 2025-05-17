import { z } from "zod";
import ExcelJS from 'exceljs';
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

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
                padronDataId: z.string().optional()
            })
        )
        .mutation(async ({ ctx, input }) => {
            const formData = await ctx.prisma.formData.create({
                data: {
                    ...input,
                    userId: ctx.session?.user.id,
                },
            });

            return formData;
        }),
    updateForm: publicProcedure
        .input(
            z.object({
                id: z.string(),
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
                padronDataId: z.string().optional()
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id, ...inputData } = input;

            const formData = await ctx.prisma.formData.update({
                where: {
                    id: id
                },
                data: {
                    ...inputData,
                    userId: ctx.session?.user.id,
                },
            });

            return formData;
        }),
    retrieveContacts: protectedProcedure
        .input(z.object({
            search: z.string().optional(),
            page: z.number().optional(),
            limit: z.number().optional(),
        }))
        .query(async ({ ctx, input }) => {
            const { search, page = 1, limit = 10 } = input;

            const whereClause = {
                userId: ctx.session.user.id,
                OR: search ? [
                    { nombre_completo: { contains: search, mode: 'insensitive' } },
                    { rut: { contains: search, mode: 'insensitive' } },
                    { direccion: { contains: search, mode: 'insensitive' } },
                    { comuna: { contains: search, mode: 'insensitive' } },
                    { region: { contains: search, mode: 'insensitive' } },
                ] : undefined,
            };

            const contacts = await ctx.prisma.formData.findMany({
                where: whereClause as any,
                skip: (page - 1) * limit,
                take: limit,
            });

            const totalContacts = await ctx.prisma.formData.count({
                where: whereClause as any,
            });

            return { contacts, totalContacts };
        }),
    retrieveContactsByAdmin: protectedProcedure
        .input(z.object({
            search: z.string().optional(),
            page: z.number().optional(),
            limit: z.number().optional(),
        }))
        .query(async ({ ctx, input }) => {
            const { search, page = 1, limit = 10 } = input;
            const authorizedUsers = ['adominguezvallejos@gmail.com', 'vichudo@gmail.com', 'formtazk@gmail.com']

            if (!authorizedUsers.includes(String(ctx.session.user.email))) return {}

            const whereClause = {
                OR: search ? [
                    { nombre_completo: { contains: search, mode: 'insensitive' } },
                    { rut: { contains: search, mode: 'insensitive' } },
                    { direccion: { contains: search, mode: 'insensitive' } },
                    { comuna: { contains: search, mode: 'insensitive' } },
                    { region: { contains: search, mode: 'insensitive' } },
                ] : undefined,
            };

            const contacts = await ctx.prisma.formData.findMany({
                where: whereClause as any,
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    user: {
                        select: {
                            email: true
                        }
                    }
                }
            });

            const totalContacts = await ctx.prisma.formData.count({
                where: whereClause as any,
            });

            return { contacts, totalContacts };
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

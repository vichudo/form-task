import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import ExcelJS from 'exceljs';
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";

// Update the ContactInput type to match Prisma's expected input
type ContactInput = Omit<Prisma.FormDataUncheckedCreateInput, 'id'>;

export const adminRouter = createTRPCRouter({
    retrieveUsers: protectedProcedure.query(async ({ ctx }) => {
        // First, fetch all users without counts
        const users = await ctx.prisma.user.findMany({
            select: {
                id: true,
                email: true,
            },
        });

        // Then, fetch counts for each user separately
        const usersWithCounts = await Promise.all(
            users.map(async (user) => {
                const count = await ctx.prisma.formData.count({
                    where: { userId: user.id },
                });
                return {
                    ...user,
                    contactCount: count,
                };
            })
        );

        return usersWithCounts;
    }),
    import: protectedProcedure
        .input(z.object({
            file: z.string(),
            userId: z.string(),
            overwrite: z.boolean().optional().default(false),
        }))
        .mutation(async ({ ctx, input }) => {
            const buffer = Buffer.from(input.file, 'base64');

            let contacts: ContactInput[];
            try {
                contacts = await parseExcelFile(buffer, input.userId);
            } catch (error) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Failed to parse Excel file',
                    cause: error,
                });
            }

            try {
                const result = await ctx.prisma.$transaction(async (prisma) => {
                    const normalizedContacts = contacts.map(contact => ({
                        ...contact,
                        rut: normalizeRut(contact.rut || ''),
                    }));

                    const existingRuts = await prisma.formData.findMany({
                        where: {
                            userId: input.userId,
                            rut: { in: normalizedContacts.map(c => c.rut) },
                        },
                        select: { rut: true },
                    });

                    const existingRutSet = new Set(existingRuts.map(c => c.rut));

                    const contactsToCreate = normalizedContacts.filter(c => !existingRutSet.has(c.rut));
                    const contactsToUpdate = input.overwrite ? normalizedContacts.filter(c => existingRutSet.has(c.rut)) : [];

                    let createCount = 0;
                    let updateCount = 0;

                    if (contactsToCreate.length > 0) {
                        const createResult = await prisma.formData.createMany({
                            data: contactsToCreate,
                        });
                        createCount = createResult.count;
                    }

                    if (input.overwrite && contactsToUpdate.length > 0) {
                        await Promise.all(contactsToUpdate.map(contact =>
                            prisma.formData.updateMany({
                                where: { userId: input.userId, rut: contact.rut },
                                data: {
                                    ...contact,
                                },
                            })
                        ));
                        updateCount = contactsToUpdate.length;
                    }

                    return { createCount, updateCount };
                }, {
                    maxWait: 15000, // 15 seconds
                    timeout: 60000, // 60 seconds
                });

                if (result.createCount === 0 && result.updateCount === 0) {
                    return {
                        message: "No hay nuevos contactos para importar. Todos los contactos en el archivo ya existen en la base de datos.",
                        importedCount: 0,
                        updatedCount: 0,
                    };
                }

                return {
                    message: `Se importaron ${result.createCount} nuevos contactos y se actualizaron ${result.updateCount} contactos existentes.`,
                    importedCount: result.createCount,
                    updatedCount: result.updateCount,
                };
            } catch (error) {
                console.error('Import error:', error);
                if (error instanceof Prisma.PrismaClientKnownRequestError) {
                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: `Error de base de datos: ${error.message}`,
                        cause: error,
                    });
                } else {
                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Ocurrió un error inesperado durante la importación',
                        cause: error,
                    });
                }
            }
        }),
});

function normalizeRut(rut: string): string {
    // Remove all non-alphanumeric characters except the dash
    const cleanRut = rut.replace(/[^0-9kK-]/g, '').toUpperCase();

    // If the RUT doesn't contain a dash, add it
    if (!cleanRut.includes('-')) {
        const rutBody = cleanRut.slice(0, -1);
        const rutDv = cleanRut.slice(-1);
        return `${rutBody}-${rutDv}`;
    }

    return cleanRut;
}

async function parseExcelFile(buffer: Buffer, userId: string): Promise<ContactInput[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.getWorksheet(1);

    if (!worksheet) {
        throw new Error('No worksheet found in the uploaded file');
    }

    const contacts: ContactInput[] = [];
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber === 1) return; // Skip the header row
        const contact: ContactInput = {
            rut: normalizeRut(row.getCell(1).value?.toString() || ''),
            nombre_completo: row.getCell(2).value?.toString() || null,
            telefono: row.getCell(3).value?.toString() || null,
            direccion: row.getCell(4).value?.toString() || null,
            comuna: row.getCell(5).value?.toString() || null,
            region: row.getCell(6).value?.toString() || null,
            nacionalidad: row.getCell(7).value?.toString() || null,
            mail: row.getCell(8).value?.toString() || null,
            instagram: row.getCell(9).value?.toString() || null,
            facebook: row.getCell(10).value?.toString() || null,
            twitter: row.getCell(11).value?.toString() || null,
            etiqueta_1: row.getCell(12).value?.toString() || null,
            etiqueta_2: row.getCell(13).value?.toString() || null,
            etiqueta_3: row.getCell(14).value?.toString() || null,
            comentario: row.getCell(15).value?.toString() || null,
            userId: userId,
        };
        contacts.push(contact);
    });

    return contacts;
}
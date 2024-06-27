import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const BATCH_SIZE = 1000; // Adjust based on your memory and performance needs

export const dummyRouter = createTRPCRouter({
    loadData: publicProcedure.mutation(async ({ ctx }) => {
        const csvFilePath = path.resolve(__dirname, 'Padrón Provisorio Chile 2021 (1).txt');
        const records: any[] = [];
        let batch: any[] = [];

        return new Promise((resolve, reject) => {
            const stream = fs.createReadStream(csvFilePath, { encoding: 'utf8' })
                .pipe(csv({ separator: ';' })) // Specify semicolon as the delimiter
                .on('data', async (row) => {
                    batch.push({
                        NOMBRES: row.NOMBRES,
                        APELLIDO_PATERNO: row.APELLIDO_PATERNO,
                        APELLIDO_MATERNO: row.APELLIDO_MATERNO,
                        RUN: row.RUN,
                        DV: row.DV,
                        SEXO: row.SEXO,
                        CALLE: row.CALLE,
                        NUMERO: row.NUMERO,
                        LETRA: row.LETRA,
                        RESTO_DOMICILIO: row.RESTO_DOMICILIO,
                        GLOSACIRCUNSCRIPCION: row.GLOSACIRCUNSCRIPCION,
                        GLOSACOMUNA: row.GLOSACOMUNA,
                        GLOSAPROVINCIA: row.GLOSAPROVINCIA,
                        GLOSAREGION: row.GLOSAREGION,
                        GLOSAPAIS: row.GLOSAPAIS,
                        MESA: row.MESA
                    });

                    if (batch.length >= BATCH_SIZE) {
                        stream.pause(); // Pause the stream to avoid overloading
                        try {
                            await ctx.prisma.padronData.createMany({ data: batch });
                            batch = [];
                            stream.resume(); // Resume the stream after the batch is inserted
                        } catch (error) {
                            reject(error);
                            stream.destroy();
                        }
                    }
                })
                .on('end', async () => {
                    if (batch.length > 0) {
                        try {
                            await ctx.prisma.padronData.createMany({ data: batch });
                        } catch (error) {
                            return reject(error);
                        }
                    }
                    resolve({ success: true });
                })
                .on('error', (error) => {
                    reject(error);
                });
        });
    }),
    getDistinctCommunes: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.prisma.padronData.groupBy({
            // by: ['GLOSACOMUNA'],
            by: ['GLOSAREGION'],
        });
    })
});

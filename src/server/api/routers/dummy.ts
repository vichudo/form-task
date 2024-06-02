import { createTRPCRouter, publicProcedure } from "../trpc";
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

export const dummyRouter = createTRPCRouter({
    loadData: publicProcedure.mutation(async ({ ctx }) => {
        // Assuming the CSV file is in the root directory of your project
        const csvFilePath = path.resolve(__dirname, '/Users/vicentegonzalez/Documents/Github/form-task/src/server/api/routers/Padrón_Provisorio_Chile_2021.csv');
        const records: any[] = [];

        return new Promise((resolve, reject) => {
            fs.createReadStream(csvFilePath)
                .pipe(csv())
                .on('data', (row) => {
                    records.push({
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
                })
                .on('end', async () => {
                    try {
                        await ctx.prisma.padronData.createMany({
                            data: records
                        });
                        resolve({ success: true });
                    } catch (error) {
                        reject(error);
                    }
                })
                .on('error', (error) => {
                    reject(error);
                });
        });
    })
});

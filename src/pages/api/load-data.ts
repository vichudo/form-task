// import { NextApiRequest, NextApiResponse } from "next";
// import fs from 'fs';
// import path from 'path';
// import csv from 'csv-parser';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();
// const BATCH_SIZE = 5000; // Adjust based on your memory and performance needs
// const CONCURRENT_BATCHES = 5; // Number of concurrent batches to process

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     if (req.method !== 'POST') {
//         res.status(405).json({ message: 'Method not allowed' });
//         return;
//     }

//     const csvFilePath = path.resolve(process.cwd(), '/Users/vicentegonzalez/Documents/Github/form-task/src/pages/api/Padrón Provisorio Chile 2021 (1).txt');
//     const recordsQueue: any[] = [];
//     let batch: any[] = [];
//     let totalRecords = 0;

//     console.log('Starting CSV processing...');

//     return new Promise<void>((resolve, reject) => {
//         const stream = fs.createReadStream(csvFilePath, { encoding: 'utf8' })
//             .pipe(csv({ separator: ';' }))
//             .on('data', (row) => {
//                 batch.push({
//                     NOMBRES: row.NOMBRES,
//                     APELLIDO_PATERNO: row.APELLIDO_PATERNO,
//                     APELLIDO_MATERNO: row.APELLIDO_MATERNO,
//                     RUN: row.RUN,
//                     DV: row.DV,
//                     SEXO: row.SEXO,
//                     CALLE: row.CALLE,
//                     NUMERO: row.NUMERO,
//                     LETRA: row.LETRA,
//                     RESTO_DOMICILIO: row.RESTO_DOMICILIO,
//                     GLOSACIRCUNSCRIPCION: row.GLOSACIRCUNSCRIPCION,
//                     GLOSACOMUNA: row.GLOSACOMUNA,
//                     GLOSAPROVINCIA: row.GLOSAPROVINCIA,
//                     GLOSAREGION: row.GLOSAREGION,
//                     GLOSAPAIS: row.GLOSAPAIS,
//                     MESA: row.MESA
//                 });

//                 if (batch.length >= BATCH_SIZE) {
//                     recordsQueue.push([...batch]);
//                     totalRecords += batch.length;
//                     console.log(`Batch of ${batch.length} records added to queue. Total records queued: ${totalRecords}`);
//                     batch = [];
//                 }

//                 if (recordsQueue.length >= CONCURRENT_BATCHES) {
//                     stream.pause();
//                 }
//             })
//             .on('end', async () => {
//                 if (batch.length > 0) {
//                     recordsQueue.push([...batch]);
//                     totalRecords += batch.length;
//                     console.log(`Final batch of ${batch.length} records added to queue. Total records queued: ${totalRecords}`);
//                 }

//                 try {
//                     await processQueue(recordsQueue);
//                     console.log(`All ${totalRecords} records processed successfully.`);
//                     res.status(200).json({ success: true });
//                 } catch (error) {
//                     // console.error('Error processing records:', error);
//                     res.status(500).json({ error: error.message });
//                 }
//                 resolve();
//             })
//             .on('error', (error) => {
//                 console.error('Error reading CSV file:', error);
//                 res.status(500).json({ error: error.message });
//                 reject(error);
//             });

//         async function processQueue(queue: any[]) {
//             while (queue.length > 0) {
//                 const currentBatches = queue.splice(0, CONCURRENT_BATCHES);
//                 console.log(`Processing ${currentBatches.length} concurrent batches...`);
//                 await Promise.all(currentBatches.map(batch => prisma.padronData.createMany({ data: batch })));
//                 console.log(`Processed ${currentBatches.length} batches successfully.`);
//                 stream.resume();
//             }
//         }
//     });
// }

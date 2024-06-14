// // pages/api/updateCharacterEncoding.js
// import { MongoClient } from 'mongodb';
// import { NextApiRequest, NextApiResponse } from 'next';

// const uri = "mongodb+srv://formtaskadmin:megalolazo98@formtaskinstance.bfi4zu5.mongodb.net/main?retryWrites=true&w=majority&appName=formTaskInstance";

// const updateCharacterEncoding = async (req: NextApiRequest, res: NextApiResponse) => {
//     if (req.method !== 'POST') {
//         return res.status(405).json({ message: 'Only POST requests are allowed' });
//     }

//     const client = new MongoClient(uri);

//     try {
//         await client.connect();
//         const database = client.db("main"); // Your database name
//         const collection = database.collection("padrondata");

//         const updateFields = [
//             "NOMBRES",
//             "APELLIDO_PATERNO",
//             "APELLIDO_MATERNO",
//             "CALLE",
//             "RESTO_DOMICILIO",
//             "GLOSACIRCUNSCRIPCION",
//             "GLOSACOMUNA",
//             "GLOSAPROVINCIA",
//             "GLOSAREGION",
//             "GLOSAPAIS",
//         ];

//         for (const field of updateFields) {
//             await collection.updateMany(
//                 { [field]: { $regex: "�" } },
//                 [
//                     {
//                         $set: {
//                             [field]: {
//                                 $replaceAll: { input: `$${field}`, find: "�", replacement: "Ñ" }
//                             }
//                         }
//                     }
//                 ]
//             );
//         }

//         res.status(200).json({ success: true, message: "Records updated successfully." });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, message: "An error occurred while updating records." });
//     } finally {
//         await client.close();
//     }
// };

// export default updateCharacterEncoding;

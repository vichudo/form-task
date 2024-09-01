import React, { useState, type FC } from 'react';
import { Loader2, Download, CheckCircle, XCircle } from 'lucide-react';
import { trpc } from '~/utils/api';

export const SmsAdminView: FC = () => {
    const [error, setError] = useState<string | null>(null);

    const { data: requests, isLoading, refetch } = trpc.smsRouter.retrieveRequestsFromAdmin.useQuery();
    const updateStatusMutation = trpc.smsRouter.updateRequestStatus.useMutation();
    const getExcelFileMutation = trpc.smsRouter.getExcelFileForAdmin.useMutation();

    const handleStatusUpdate = async (requestId: string, newStatus: 'completed' | 'cancelled') => {
        try {
            await updateStatusMutation.mutateAsync({ requestId, status: newStatus });
            await refetch();
        } catch (err) {
            setError('Error updating status. Please try again.');
        }
    };

    const handleExcelDownload = async (requestId: string) => {
        try {
            const result = await getExcelFileMutation.mutateAsync({ requestId });
            if (result?.base64String) {
                const blob = base64ToBlob(result.base64String, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `contacts_${requestId}.xlsx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            setError('Error downloading Excel file. Please try again.');
        }
    };

    const base64ToBlob = (base64: string, type = 'application/octet-stream') => {
        const binStr = atob(base64);
        const len = binStr.length;
        const arr = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            arr[i] = binStr.charCodeAt(i);
        }
        return new Blob([arr], { type });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="py-8 bg-white sm:py-12">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-8">Admin SMS Requests</h2>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 rounded-md">
                        <p className="text-center text-red-600">{error}</p>
                    </div>
                )}

                {requests && requests.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Mensaje</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contactos</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {requests.map((request) => (
                                    <tr key={request.id}>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="max-w-xs break-words">{request.message}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.contactsQty}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${request?.price?.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${request.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {request.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleStatusUpdate(request.id, 'completed')}
                                                className="text-green-600 hover:text-green-900 mr-2"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(request.id, 'cancelled')}
                                                className="text-red-600 hover:text-red-900 mr-2"
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleExcelDownload(request.id)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <Download className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-gray-500">No pending SMS requests found.</p>
                )}
            </div>
        </div>
    );
};
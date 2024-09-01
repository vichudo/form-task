import React, { useState, useEffect, type FC } from 'react';
import { UserIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { RouterInputs, trpc } from '~/utils/api';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Loader2 } from 'lucide-react'


const PRICE_PER_SMS = 10; // CLP

type FormInputs = RouterInputs['smsRouter']['createRequest'];

export const SmsSection: FC = () => {
    const [error, setError] = useState('');

    const { data: totalContacts, isLoading: isLoadingTotalContacts } = trpc.smsRouter.getTotalContacts.useQuery();
    const { data: smsRequests, isLoading: isLoadingRequests, refetch: refetchRequests } = trpc.smsRouter.getUserRequests.useQuery();
    const createRequestMutation = trpc.smsRouter.createRequest.useMutation();
    const cancelRequestMutation = trpc.smsRouter.cancelRequest.useMutation();

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormInputs>({
        defaultValues: {
            message: '',
            contactsQty: 0,
            price: 0,
        }
    });

    const watchContactsQty = watch('contactsQty');

    useEffect(() => {
        if (totalContacts !== undefined) {
            setValue('contactsQty', totalContacts);
            setValue('price', totalContacts * PRICE_PER_SMS);
        }
    }, [totalContacts, setValue]);

    useEffect(() => {
        const price = (watchContactsQty || 0) * PRICE_PER_SMS;
        setValue('price', price);
    }, [watchContactsQty, setValue]);

    const handleMaxClick = () => {
        if (totalContacts !== undefined) {
            setValue('contactsQty', totalContacts);
            setError('');
        }
    };

    const onSubmit: SubmitHandler<FormInputs> = async (data) => {
        if (totalContacts === undefined) return;
        if (data.contactsQty > totalContacts) {
            setError(`El total de tus contactos es ${totalContacts}`);
            return;
        }
        setError('');
        try {
            await createRequestMutation.mutateAsync(data);
            setValue('message', '');
            setValue('contactsQty', totalContacts);
            await refetchRequests();
        } catch (err) {
            setError('Hubo un error al crear la solicitud. Por favor, inténtelo de nuevo.');
        }
    };

    const handleCancelRequest = async (requestId: string) => {
        try {
            await cancelRequestMutation.mutateAsync({ requestId });
            await refetchRequests();
        } catch (err) {
            setError('Hubo un error al cancelar la solicitud. Por favor, inténtelo de nuevo.');
        }
    };

    if (isLoadingTotalContacts) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (totalContacts === undefined) {
        return <div className="text-center mt-8">Error al cargar los contactos. Por favor, intente de nuevo más tarde.</div>;
    }

    return (
        <div className="py-8 bg-white sm:py-12">
            <div className="px-4 mx-auto max-w-4xl sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Envío de SMS</h2>
                    <p className="mt-4 text-xl text-gray-500">Envíale un SMS a tus contactos de forma masiva</p>
                </div>

                <div className="mt-10">
                    <div className="flex items-center justify-center space-x-2">
                        <UserIcon className="w-8 h-8 text-indigo-500" />
                        <span className="text-4xl font-bold text-indigo-600">{totalContacts}</span>
                        <span className="text-xl text-gray-500">contactos totales</span>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
                        <div className="relative">
                            <label htmlFor="contactsQty" className="absolute -top-2 left-2 inline-block px-1 text-xs font-medium text-gray-900 bg-white">
                                A cuántos contactos quieres enviarle SMS
                            </label>
                            <div className="flex">
                                <input
                                    type="number"
                                    id="contactsQty"
                                    {...register('contactsQty', {
                                        required: 'Este campo es requerido',
                                        min: { value: 1, message: 'Debe ser al menos 1' },
                                        max: { value: totalContacts, message: `Máximo ${totalContacts} contactos` }
                                    })}
                                    className={`block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border ${errors.contactsQty ? 'border-red-300' : 'border-gray-300'} rounded-l-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                />
                                <button
                                    type="button"
                                    onClick={handleMaxClick}
                                    className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-r-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Max
                                </button>
                            </div>
                            {errors.contactsQty && (
                                <div className="flex items-center mt-1 text-sm text-red-600">
                                    <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                                    {errors.contactsQty.message}
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <label htmlFor="message" className="absolute -top-2 left-2 inline-block px-1 text-xs font-medium text-gray-900 bg-white">
                                Mensaje SMS
                            </label>
                            <textarea
                                id="message"
                                {...register('message', { required: 'El mensaje es requerido', maxLength: { message: "Los SMS solo permiten 160 caracteres", value: 160 } })}
                                rows={4}
                                className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Escribe tu mensaje aquí..."
                            />
                            {errors.message && (
                                <div className="flex items-center mt-1 text-sm text-red-600">
                                    <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                                    {errors.message.message}
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-indigo-50 rounded-lg">
                            <p className="text-lg font-medium text-indigo-800">
                                Precio total: <span className="text-2xl font-bold">${watch('price').toLocaleString()} CLP</span>
                            </p>
                            <p className="mt-1 text-sm text-indigo-600">
                                ${PRICE_PER_SMS} CLP por contacto
                            </p>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={createRequestMutation.isPending}
                                className="inline-flex items-center justify-center w-full px-6 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {createRequestMutation.isPending ? 'Enviando...' : 'Solicitar envío de SMS'}
                            </button>
                        </div>
                    </form>
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 rounded-md">
                        <p className="text-center text-red-600">{error}</p>
                    </div>
                )}

                {/* Previous SMS Requests Table */}
                <div className="mt-16">
                    <h3 className="text-2xl font-bold text-gray-900">Solicitudes anteriores</h3>
                    {isLoadingRequests ? (
                        <div className="mt-4 text-center">Cargando solicitudes...</div>
                    ) : smsRequests && smsRequests.length > 0 ? (
                        <div className="mt-4 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Mensaje</th>
                                        <th scope="col" className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Contactos</th>
                                        <th scope="col" className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Precio</th>
                                        <th scope="col" className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Estado</th>
                                        <th scope="col" className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Fecha</th>
                                        <th scope="col" className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {smsRequests.filter(({ status }) => status !== 'cancelled').map((request) => (
                                        <tr key={request.id}>
                                            <td className="px-3 py-4 text-sm text-gray-500 max-w-[150px] ">{request.message}</td>
                                            <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">{request.contactsQty}</td>
                                            <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">${request?.price?.toLocaleString()}</td>
                                            <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${request.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                    {request.status === 'completed' ? 'Completado' :
                                                        request.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                                                {new Date(request.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-3 py-4 text-sm font-medium whitespace-nowrap">
                                                {request.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleCancelRequest(request.id)}
                                                        disabled={cancelRequestMutation.isPending}
                                                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                                    >
                                                        {cancelRequestMutation.isPending ? 'Cancelando...' : 'Cancelar'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="mt-4 p-4 bg-gray-50 rounded-md">
                            <p className="text-center text-gray-500">No hay solicitudes anteriores.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
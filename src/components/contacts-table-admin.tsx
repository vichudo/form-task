import React, { useState, useEffect, FormEvent, type FC } from 'react';
import { trpc } from '~/utils/api';
import { UserIcon, PlusCircleIcon, DocumentArrowDownIcon, ArrowUpRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { WarningModal } from './warning-modal';
import toast from 'react-hot-toast';
import { GenericModal } from './generic-modal';
import { useAtom } from 'jotai';
import { selectedContact } from './store';
import { EditForm } from './edit-form';
import 'dayjs/locale/es';
import dayjs from 'dayjs';
dayjs.locale('es');

export const ContactsTableAdmin: FC = () => {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const limit = 10; // Number of contacts per page
    const [queryVariables, setQueryVariables] = useState({ search: '', page: 1, limit });

    const { data, isLoading, refetch } = trpc.formRouter.retrieveContactsByAdmin.useQuery(queryVariables, {
        enabled: false, // Disable automatic query execution
    });

    const [idToDelete, setIdToDelete] = useState<string>();
    const [displayDeleteModal, setDisplayDeleteModal] = useState<boolean>(false);
    const [displayEditModal, setDisplayEditModal] = useState<boolean>(false);
    const { mutateAsync: deleteContact } = trpc.formRouter.deleteContactById.useMutation();
    const { mutateAsync: exportContactsToExcel } = trpc.formRouter.exportContactsToExcel.useMutation();
    const [selectedOption, setSelectedOption] = useAtom(selectedContact);

    useEffect(() => {
        refetch();
    }, [queryVariables]);

    useEffect(() => {
        if (search === '') {
            setQueryVariables({ search: '', page: 1, limit });
        }
    }, [search]);

    const handleDeleteModal = (idToDelete: string) => {
        setIdToDelete(idToDelete);
        setDisplayDeleteModal(true);
    };

    const handleDeletion = async () => {
        if (!idToDelete) return;
        await toast.promise(deleteContact({ id: idToDelete }), {
            error: 'Ocurrió un error eliminando el contacto',
            loading: 'Eliminando...',
            success: 'Contacto eliminado',
        });
        refetch();
    };

    const handleEditModal = (contact: any) => {
        setDisplayEditModal(true);
        setSelectedOption(contact);
    };

    const handleExport = async () => {
        try {
            const { base64String } = await exportContactsToExcel();
            const binaryString = atob(base64String);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'contactos.xlsx';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success('Excel exportado');
        } catch (error) {
            toast.error('Ocurrió un error exportando excel');
        }
    };

    const handleSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPage(1); // Reset to first page when a new search is made
        setQueryVariables({ search, page: 1, limit });
    };

    const totalPages = Math.ceil((data?.totalContacts || 0) / limit);

    return (
        <>
            <GenericModal open={displayEditModal} setOpen={setDisplayEditModal}>
                <EditForm setOpen={setDisplayEditModal} />
            </GenericModal>
            <WarningModal
                bindings={{ open: displayDeleteModal, setOpen: setDisplayDeleteModal }}
                title='Estas seguro que deseas borrar este contacto?'
                description={'Esta acción es totalmente irreversible'}
                buttons={{
                    close: 'Cancelar',
                    confirm: 'Eliminar contacto',
                }}
                confirmAction={handleDeletion}
            />
            <div className='flex justify-center mt-4 gap-2'>
                <div className='text-emerald-50 bg-gray-600 w-fit text-center rounded-md px-2 py-1 text-sm shadow-md shadow-gray-300 font-bold'>⭐️ Vista Admin</div>
                <div className='text-emerald-50 w-fit text-center rounded-md px-2 py-1 text-sm shadow-md shadow-gray-300 font-bold flex bg-indigo-600'>
                    <Link href={`/admin/sms`}>
                        ⭐️ Ir a Panel de Solicitudes SMS
                    </Link>
                    <ArrowUpRightIcon className='w-4' /></div>
            </div>
            <div className="py-8 bg-white sm:py-12 lg:py-12">
                <div className="px-4 mx-2 max-w-full sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-between sm:flex-row">
                        <div>
                            <p className="text-xl font-bold text-gray-900 sm:text-2xl">Todos los Contactos</p>
                            <p className="mt-2 text-sm font-medium text-gray-600 sm:text-base">Todos los contactos que se han registrado por todos los usuarios.</p>
                        </div>

                        <div className="flex flex-col items-center mt-4 space-y-4 sm:mt-0 sm:flex-row sm:space-y-0 sm:space-x-4">
                            <form onSubmit={handleSearch} className="flex space-x-2">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="px-4 py-2 border rounded-md"
                                    placeholder="Buscar contactos..."
                                />
                                <button
                                    type="submit"
                                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Buscar
                                </button>
                            </form>
                            <Link
                                href={'/form'}
                                type="button"
                                className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-base"
                            >
                                <PlusCircleIcon className="w-5 h-5 mr-2 -ml-1" />
                                Crear nuevo
                            </Link>
                            <button
                                type="button"
                                onClick={handleExport}
                                className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-base"
                            >
                                <DocumentArrowDownIcon className="w-5 h-5 mr-2 -ml-1" />
                                Exportar a excel
                            </button>
                        </div>
                    </div>

                    <div className="hidden mt-8 overflow-x-scroll lg:block">
                        {isLoading ? (
                            <div className="flex items-center justify-center mt-16">
                                <div className="flex space-x-2">
                                    <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce"></div>
                                    <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce animation-delay-200"></div>
                                    <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce animation-delay-400"></div>
                                </div>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Nombre Completo</th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">RUT</th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Dirección</th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Comuna</th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Región</th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Registrado por</th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Creado en</th>
                                        <th className="relative px-6 py-3 whitespace-nowrap">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {data?.contacts?.map((contact) => (
                                        <tr key={contact.id}>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{contact.nombre_completo}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{contact.rut}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{contact.direccion}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{contact.comuna}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{contact.region}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{contact.user?.email}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{dayjs(contact.createdAt).format('DD/MM/YYYY')}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                                <button onClick={() => handleEditModal(contact)} className="text-indigo-600 hover:text-indigo-900">
                                                    Editar
                                                </button>
                                                <span className="mx-2 text-gray-300">|</span>
                                                <button onClick={() => handleDeleteModal(contact.id)} className="text-red-600 hover:text-red-900">
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div className="mt-8 space-y-3 lg:hidden">
                        {isLoading ? (
                            <div className="flex items-center justify-center mt-16">
                                <div className="flex space-x-2">
                                    <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce"></div>
                                    <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce animation-delay-200"></div>
                                    <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce animation-delay-400"></div>
                                </div>
                            </div>
                        ) : (
                            data?.contacts?.map((contact) => (
                                <div key={contact.id} className="bg-white shadow-lg rounded-lg">
                                    <div className="px-4 py-5 sm:px-6">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16">
                                                <UserIcon className="w-12 h-12 text-gray-400 sm:w-16 sm:h-16" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-lg font-medium text-gray-900 sm:text-xl">{contact.nombre_completo}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-4 py-5 border-t border-gray-200 sm:px-6">
                                        <dl className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
                                            <div className="sm:col-span-1">
                                                <dt className="text-sm font-medium text-gray-500">RUT</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{contact.rut}</dd>
                                            </div>
                                            <div className="sm:col-span-1">
                                                <dt className="text-sm font-medium text-gray-500">Dirección</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{contact.direccion}</dd>
                                            </div>
                                            <div className="sm:col-span-1">
                                                <dt className="text-sm font-medium text-gray-500">Comuna</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{contact.comuna}</dd>
                                            </div>
                                            <div className="sm:col-span-1">
                                                <dt className="text-sm font-medium text-gray-500">Región</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{contact.region}</dd>
                                            </div>
                                            <div className="sm:col-span-1">
                                                <dt className="text-sm font-medium text-gray-500">Registrado por</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{contact.user?.email}</dd>
                                            </div>
                                            <div className="sm:col-span-1">
                                                <dt className="text-sm font-medium text-gray-500">Creado en</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{dayjs(contact.createdAt).format('DD/MM/YYYY')}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                    <div className="px-4 py-4 bg-gray-50 sm:px-6">
                                        <div className="flex justify-end space-x-3">
                                            <button onClick={() => handleEditModal(contact)} type="button" className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                                Editar
                                            </button>
                                            <button onClick={() => handleDeleteModal(contact.id)} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="flex justify-between mt-4">
                        <button
                            onClick={() => {
                                const newPage = Math.max(page - 1, 1);
                                setPage(newPage);
                                setQueryVariables({ search, page: newPage, limit });
                            }}
                            disabled={page === 1}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            Anterior
                        </button>
                        <span className="px-4 py-2 text-sm font-medium text-gray-700">
                            Página {page} de {totalPages} ({data?.totalContacts} contactos)
                        </span>
                        <button
                            onClick={() => {
                                const newPage = Math.min(page + 1, totalPages);
                                setPage(newPage);
                                setQueryVariables({ search, page: newPage, limit });
                            }}
                            disabled={page === totalPages}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

import React, { useState, useCallback, useMemo } from 'react';
import { trpc } from '~/utils/api';
import { DocumentArrowDownIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
dayjs.locale('es');

const CONTACT_THRESHOLD = 50000;
const INITIAL_PAGE_SIZE = 10;

export const SelectableContactsTable: React.FC = () => {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

    const queryVariables = useMemo(() => ({
        search,
        page,
        limit: INITIAL_PAGE_SIZE,
        userId: selectedUserId
    }), [search, page, selectedUserId]);

    const { data: initialData, isLoading: isInitialLoading } = trpc.formRouter.retrieveContactsByAdminWithUserFilter.useQuery(queryVariables, {
        // keepPreviousData: true,
        staleTime: 5000, // Keep data fresh for 5 seconds
    });

    const { data: userContactCount } = trpc.formRouter.getUserContactCount.useQuery(
        { userId: selectedUserId || '' },
        { enabled: !!selectedUserId }
    );

    const { data: users } = trpc.formRouter.getAllUsers.useQuery(undefined, {
        staleTime: Infinity, // This data rarely changes, so we can cache it indefinitely
    });

    const exportSelectedContactsToExcel = trpc.formRouter.exportSelectedContactsToExcel.useMutation();

    const contacts = initialData?.contacts || [];
    const totalContacts = initialData?.totalContacts || 0;
    const totalPages = Math.ceil(totalContacts / INITIAL_PAGE_SIZE);

    const handleSearch = useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPage(1);
        setSearch(e.currentTarget.search.value);
    }, []);

    const handleUserChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const userId = e.target.value === 'all' ? undefined : e.target.value;
        setSelectedUserId(userId);
        setPage(1);
        setSearch('');
    }, []);

    const handleContactSelection = useCallback((contactId: string) => {
        setSelectedContacts(prev =>
            prev.includes(contactId)
                ? prev.filter(id => id !== contactId)
                : [...prev, contactId]
        );
    }, []);

    const handleSelectAll = useCallback(() => {
        setSelectedContacts(prev =>
            prev.length === contacts.length ? [] : contacts.map(contact => contact.id)
        );
    }, [contacts]);

    const handleExport = useCallback(async () => {
        if (selectedContacts.length === 0) {
            toast.error('Por favor, selecciona al menos un contacto para exportar.');
            return;
        }

        if (selectedContacts.length > CONTACT_THRESHOLD) {
            toast.error(`No se pueden exportar más de ${CONTACT_THRESHOLD} contactos a la vez. Por favor, selecciona menos contactos.`);
            return;
        }

        try {
            const { base64String } = await exportSelectedContactsToExcel.mutateAsync({ selectedIds: selectedContacts });
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
            a.download = 'contactos_seleccionados.xlsx';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success('Excel exportado');
        } catch (error) {
            toast.error('Ocurrió un error exportando excel');
        }
    }, [selectedContacts, exportSelectedContactsToExcel]);

    return (
        <div className="py-8 bg-white sm:py-12 lg:py-12">
            <div className="px-4 mx-2 max-w-full sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-between sm:flex-row">
                    <div>
                        <p className="text-xl font-bold text-gray-900 sm:text-2xl">Contactos Seleccionables</p>
                        <p className="mt-2 text-sm font-medium text-gray-600 sm:text-base">Selecciona y filtra contactos por usuario.</p>
                    </div>

                    <div className="flex flex-col items-center mt-4 space-y-4 sm:mt-0 sm:flex-row sm:space-y-0 sm:space-x-4">
                        <form onSubmit={handleSearch} className="flex space-x-2">
                            <input
                                type="text"
                                name="search"
                                defaultValue={search}
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
                        <select
                            value={selectedUserId || 'all'}
                            onChange={handleUserChange}
                            className="px-4 py-2 border rounded-md"
                        >
                            <option value="all">Todos los usuarios</option>
                            {users?.map(user => (
                                <option key={user.id} value={user.id}>{user.email}</option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={handleExport}
                            disabled={selectedContacts.length === 0}
                            className={`inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-base ${selectedContacts.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            <DocumentArrowDownIcon className="w-5 h-5 mr-2 -ml-1" />
                            Exportar seleccionados
                        </button>
                    </div>
                </div>

                {selectedUserId && (userContactCount || 0) > CONTACT_THRESHOLD && (
                    <div className="mt-4 p-4 bg-yellow-100 rounded-md">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">
                                    Advertencia: Gran cantidad de contactos
                                </h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                    <p>
                                        Este usuario tiene más de {CONTACT_THRESHOLD} contactos. Para mejorar el rendimiento,
                                        se mostrarán los contactos de forma paginada y algunas funciones pueden estar limitadas.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-8 overflow-x-auto">
                    {isInitialLoading ? (
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
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                        <input
                                            type="checkbox"
                                            checked={selectedContacts.length === contacts.length}
                                            onChange={handleSelectAll}
                                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Nombre Completo</th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">RUT</th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Teléfono</th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Dirección</th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Comuna</th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Región</th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Registrado por</th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Creado en</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {contacts.map((contact) => (
                                    <tr key={contact.id} className={selectedContacts.includes(contact.id) ? 'bg-indigo-50' : ''}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={selectedContacts.includes(contact.id)}
                                                onChange={() => handleContactSelection(contact.id)}
                                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{contact.nombre_completo}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{contact.rut}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{contact.telefono}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{contact.direccion}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{contact.comuna}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{contact.region}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{contact.user?.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{dayjs(contact.createdAt).format('DD/MM/YYYY')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="flex justify-between mt-4">
                    <button
                        onClick={() => setPage(p => Math.max(p - 1, 1))}
                        disabled={page === 1}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        Anterior
                    </button>
                    <span className="px-4 py-2 text-sm font-medium text-gray-700">
                        Página {page} de {totalPages} ({totalContacts} contactos)
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                        disabled={page === totalPages}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        </div>
    );
};
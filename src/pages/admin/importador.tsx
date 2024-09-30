import React, { useState, useCallback } from 'react';
import { Navbar } from '~/components/navbar';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, CheckCircle, User, Loader2, AlertCircle, Info, HelpCircle, RefreshCw, Download } from 'lucide-react';
import { trpc } from '~/utils/api';
import { AdminNavigation } from '~/components/admin-navigation-buttons';
import Link from 'next/link';


type FileWithPreview = File & {
    preview: string;
};

type ImportResult = {
    message: string;
    importedCount: number;
    updatedCount: number;
};

const Importer: React.FC = () => {
    const [file, setFile] = useState<FileWithPreview | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [overwrite, setOverwrite] = useState<boolean>(false);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { data: users, isLoading, isError, refetch } = trpc.adminRouter.retrieveUsers.useQuery();

    const importMutation = trpc.adminRouter.import.useMutation({
        onSuccess: (data) => {
            setUploadSuccess(true);
            setIsUploading(false);
            setImportResult(data);
            setErrorMessage(null);
            refetch();
        },
        onError: (error) => {
            setIsUploading(false);
            setUploadSuccess(false);
            setErrorMessage(error.message || "Ocurrió un error inesperado en la importación");
        },
    });

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const newFile = acceptedFiles[0] as FileWithPreview;
            newFile.preview = URL.createObjectURL(newFile);
            setFile(newFile);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
        },
        multiple: false,
        disabled: !selectedUser,
    });

    const handleSubmit = async () => {
        if (!file || !selectedUser) return;

        setIsUploading(true);
        setErrorMessage(null);

        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64String = e.target?.result?.toString().split(',')[1];

            if (base64String) {
                try {
                    await importMutation.mutateAsync({
                        file: base64String,
                        userId: selectedUser,
                        overwrite: overwrite,
                    });
                } catch (error) {
                    console.error('Import failed:', error);
                } finally {
                    setIsUploading(false);
                }
            }
        };
        reader.readAsDataURL(file);
    };

    const handleRetry = () => {
        setErrorMessage(null);
        setUploadSuccess(false);
        setImportResult(null);
    };

    const handleImportAnother = () => {
        setFile(null);
        setUploadSuccess(false);
        setImportResult(null);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <AdminNavigation />
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
                    <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800">Importar Contactos</h1>
                    <div className="mb-4 text-center">
                        <Link href="/fake_contacts.xlsx" download className="inline-flex items-center text-blue-600 hover:text-blue-800">
                            <Download className="w-4 h-4 mr-2" />
                            Descargar archivo de ejemplo
                        </Link>
                    </div>
                    {/* User selector */}
                    <div className="mb-6">
                        <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 mb-2">
                            Seleccionar Usuario
                        </label>
                        <div className="relative">
                            <select
                                id="user-select"
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                                className="block w-full pl-10 pr-4 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                disabled={isLoading || isError}
                            >
                                <option value="">Seleccione un usuario</option>
                                {users && users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.email} ({user.contactCount} contactos)
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                        </div>
                        {isLoading && <div className="flex items-center justify-center space-x-2 mt-4">
                            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                            <p className="text-sm text-gray-600 font-medium">Cargando usuarios...</p>
                        </div>}
                        {isError && <p className="mt-2 text-sm text-red-500">Error al cargar usuarios</p>}
                    </div>

                    {/* Overwrite option with popover */}
                    <div className="flex items-center space-x-2 mb-6 relative">
                        <input
                            type="checkbox"
                            id="overwrite"
                            checked={overwrite}
                            onChange={(e) => setOverwrite(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="overwrite" className="text-sm text-gray-700 flex items-center">
                            Sobrescribir contactos existentes
                            <div className="relative inline-block ml-2">
                                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 z-10">
                                    Al activar esta opción, los contactos existentes en la base de datos que tengan un RUT coincidente con los del archivo Excel serán actualizados con la información del archivo. Si está desactivada, solo se añadirán nuevos contactos sin modificar los existentes.
                                </div>
                            </div>
                        </label>
                    </div>

                    {/* Dropzone */}
                    {!uploadSuccess && !errorMessage && (
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${!selectedUser
                                ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                                : isDragActive
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-300 hover:border-blue-500 cursor-pointer'
                                }`}
                        >
                            <input {...getInputProps()} />
                            {file ? (
                                <div className="flex flex-col items-center">
                                    <FileSpreadsheet className="w-16 h-16 text-green-500 mb-2" />
                                    <p className="text-gray-600">{file.name}</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <Upload className="w-16 h-16 text-gray-400 mb-2" />
                                    <p className="text-gray-600">
                                        {selectedUser
                                            ? "Arrastra un archivo de excel con los datos de los contactos para poder cargarlos al usuario"
                                            : "Selecciona un usuario para habilitar la carga de archivos"}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* CSS for the popover */}
                    <style jsx>{`
                        .relative:hover .absolute {
                            opacity: 1;
                            visibility: visible;
                        }
                    `}</style>

                    {file && selectedUser && !uploadSuccess && !errorMessage && (
                        <button
                            onClick={handleSubmit}
                            disabled={isUploading}
                            className={`mt-4 w-full py-2 px-4 rounded-md text-white font-medium ${isUploading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            {isUploading ? 'Subiendo...' : 'Importar Contactos'}
                        </button>
                    )}

                    {uploadSuccess && importResult && (
                        <div className="mt-4 flex flex-col items-center justify-center">
                            {importResult.importedCount === 0 && importResult.updatedCount === 0 ? (
                                <>
                                    <Info className="w-8 h-8 mb-2 text-blue-500" />
                                    <span className="text-lg font-semibold text-blue-600">No se realizaron cambios</span>
                                    <p className="text-sm mt-2 text-gray-600 text-center">
                                        {importResult.message}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-8 h-8 mb-2 text-green-500" />
                                    <span className="text-lg font-semibold text-green-600">¡Importación exitosa!</span>
                                    <p className="text-sm mt-2 text-center text-gray-600">
                                        Se importaron {importResult.importedCount} nuevos contactos y se actualizaron {importResult.updatedCount} contactos existentes.
                                    </p>
                                </>
                            )}
                            <button
                                onClick={handleImportAnother}
                                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                                Importar Otro Archivo
                            </button>
                        </div>
                    )}

                    {errorMessage && (
                        <div className="mt-4 flex flex-col items-center justify-center">
                            <AlertCircle className="w-8 h-8 mb-2 text-red-500" />
                            <span className="text-lg font-semibold text-red-600">Error durante la importación</span>
                            <p className="text-sm mt-2 text-center text-gray-600">
                                {errorMessage}
                            </p>
                            <button
                                onClick={handleRetry}
                                className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reintentar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Importer;
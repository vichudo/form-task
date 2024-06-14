import { PadronData } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useForm, Controller, FieldValues } from "react-hook-form";
import toast from "react-hot-toast";
import Select, { SingleValue } from "react-select";
import { trpc } from "~/utils/api";
import { RouterInputs } from "~/utils/api";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useRutFormatter } from "~/hooks/useFormatRut";

type FormData = RouterInputs['formRouter']['submitForm'];

type SelectOption = {
    value: number;
    label: string;
};

export const Form = () => {
    const { register, control, setValue, handleSubmit, reset, watch } = useForm<FormData>({
        defaultValues: {
            rut: "",
            nombre_completo: "",
            telefono: "",
            direccion: "",
            comuna: "",
            region: "",
            nacionalidad: "",
            mail: "",
            instagram: "",
            facebook: "",
            twitter: "",
            etiqueta_1: "",
            etiqueta_2: "",
            etiqueta_3: "",
            comentario: "",
        }
    });

    const { data: session } = useSession();

    const [selectedRut, setSelectedRut] = useState<string>("");
    const [selectedOption, setSelectedOption] = useState<SelectOption | null>(null);
    const rut = watch("rut");
    const formattedRut = useRutFormatter(String(rut));

    useEffect(() => {
        setValue("rut", formattedRut);
    }, [formattedRut, setValue]);

    const { data: padronData, isLoading } = trpc.search.searchByRutStrict.useQuery(
        { rut: selectedRut },
        { enabled: selectedRut.length > 0 }
    );

    useEffect(() => {
        if (padronData && padronData.length > 0) {
            // Automatically select the first result
            const firstOption = {
                value: 0,
                label: `${padronData[0]?.NOMBRES ?? ''} ${padronData[0]?.APELLIDO_PATERNO ?? ''} ${padronData[0]?.APELLIDO_MATERNO ?? ''}`
            };
            setSelectedOption(firstOption);
            handlePadronDataSelect(firstOption);
        }
    }, [padronData]);

    const { mutateAsync: submitFormMutation, status } = trpc.formRouter.submitForm.useMutation();

    const onSubmit = async (data: FormData) => {
        try {
            await submitFormMutation({ ...data, userId: session?.user?.id, padronDataId: padronData?.[0]?.id });
            console.log("Form submitted successfully");
            reset();
            toast.success("Contacto Agregado");
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    const handleSearchClick = () => {
        const rut = watch("rut");
        setSelectedRut(String(rut));
    };

    const handlePadronDataSelect = (selectedOption: SingleValue<SelectOption>) => {
        setSelectedOption(selectedOption);
        if (!selectedOption) return;
        const data = padronData ? padronData[selectedOption.value] : null;
        if (data) {
            setValue("rut", `${data.RUN}-${data.DV}`);
            setValue("nombre_completo", `${data.NOMBRES ?? ''} ${data.APELLIDO_PATERNO ?? ''} ${data.APELLIDO_MATERNO ?? ''}`);
            setValue("direccion", `${data.CALLE ?? ''} ${data.NUMERO ?? ''} ${data.LETRA ?? ''} ${data.RESTO_DOMICILIO ?? ''}`);
            setValue("comuna", String(data.GLOSACOMUNA));
            setValue("region", String(data.GLOSAREGION));
            setValue("nacionalidad", String(data.GLOSAPAIS));
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSearchClick();
        }
    };

    const handleReset = () => {
        reset();
        setSelectedOption(null);
        setSelectedRut("");
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

            <div className="flex justify-between items-center gap-8">
                <div>
                    <h2 className="text-2xl font-semibold leading-7 text-gray-900">Ingreso de contacto</h2>
                    <p className="mt-1 text-xs md:text-sm leading-6 text-gray-600 ">
                        Ingresa el rut del contacto para verificar su información del padrón, si existe un registro la información se cargará automáticamente.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex justify-center rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition duration-150 ease-in-out hover:bg-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400"
                >
                    Limpiar
                </button>
            </div>

            <div className="space-y-6">
                <div>
                    <label htmlFor="rut" className="block text-sm font-medium leading-6 text-gray-900">
                        RUT
                    </label>
                    <div className="mt-2 flex items-center space-x-2">
                        <input
                            type="text"
                            id="rut"
                            {...register("rut")}
                            className="block w-full rounded-md border-0 py-2 px-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            onKeyDown={handleKeyDown}
                        />
                        <button
                            type="button"
                            onClick={handleSearchClick}
                            className="inline-flex items-center justify-center rounded-md bg-indigo-600 p-2 text-white shadow-sm transition duration-150 ease-in-out hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        >
                            <MagnifyingGlassIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {isLoading && (
                    <div>
                        <div className="mt-2">
                            <p className="text-sm leading-6 text-gray-600">Cargando...</p>
                        </div>
                    </div>
                )}

                {padronData && padronData.length > 0 && (
                    <div>
                        <label htmlFor="padronData" className="block text-sm font-medium leading-6 text-gray-900">
                            Seleccionar Data del Padrón
                        </label>
                        <div className="mt-2">
                            <Controller
                                name="nombre_completo"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        options={padronData.map((data, index) => ({
                                            value: index,
                                            label: `${data.NOMBRES ?? ''} ${data.APELLIDO_PATERNO ?? ''} ${data.APELLIDO_MATERNO ?? ''}`,
                                        }))}
                                        value={selectedOption}
                                        onChange={(option) => handlePadronDataSelect(option as SingleValue<SelectOption>)}
                                        className="block w-full rounded-md border-0 py-2 px-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    />
                                )}
                            />
                        </div>
                    </div>
                )}

                <div>
                    {selectedOption && padronData && (
                        <div className="border rounded p-4 mt-4 bg-gray-100 shadow-sm">
                            <h3 className="font-bold mb-2 text-lg text-indigo-700">Datos Electorales</h3>
                            <div className="space-y-1">
                                <p><strong className="text-gray-700">RUT:</strong> {`${padronData[selectedOption.value]?.RUN ?? ''}-${padronData[selectedOption.value]?.DV ?? ''}`}</p>
                                <p><strong className="text-gray-700">Nombre Completo:</strong> {`${padronData[selectedOption.value]?.NOMBRES ?? ''} ${padronData[selectedOption.value]?.APELLIDO_PATERNO ?? ''} ${padronData[selectedOption.value]?.APELLIDO_MATERNO ?? ''}`}</p>
                                <p><strong className="text-gray-700">Dirección:</strong> {`${padronData[selectedOption.value]?.CALLE ?? ''} ${padronData[selectedOption.value]?.NUMERO ?? ''} ${padronData[selectedOption.value]?.LETRA ?? ''} ${padronData[selectedOption.value]?.RESTO_DOMICILIO ?? ''}`}</p>
                                <p><strong className="text-gray-700">Comuna:</strong> {padronData[selectedOption.value]?.GLOSACOMUNA ?? ''}</p>
                                <p><strong className="text-gray-700">Región:</strong> {padronData[selectedOption.value]?.GLOSAREGION ?? ''}</p>
                                <p><strong className="text-gray-700">Provincia:</strong> {padronData[selectedOption.value]?.GLOSAPROVINCIA ?? ''}</p>
                                <p><strong className="text-gray-700">Circunscripción:</strong> {padronData[selectedOption.value]?.GLOSACIRCUNSCRIPCION ?? ''}</p>
                                <p><strong className="text-gray-700">País:</strong> {padronData[selectedOption.value]?.GLOSAPAIS ?? ''}</p>
                                <p><strong className="text-gray-700">Mesa:</strong> {padronData[selectedOption.value]?.MESA ?? ''}</p>
                                <p><strong className="text-gray-700">Sexo:</strong> {padronData[selectedOption.value]?.SEXO === '0' ? 'Femenino' : 'Masculino' ?? ''}</p>
                            </div>
                        </div>
                    )}
                </div>

                {["nombre_completo", "telefono", "direccion", "comuna", "region", "nacionalidad", "mail"].map((field) => (
                    <div key={field}>
                        <label htmlFor={field} className="block text-sm font-medium leading-6 text-gray-900">
                            {field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </label>
                        <div className="mt-2">
                            <Controller
                                name={field as keyof FormData}
                                control={control}
                                render={({ field }) => (
                                    <input
                                        type={field.name === "mail" ? "email" : field.name === "telefono" ? "tel" : "text"}
                                        id={field.name}
                                        {...field}
                                        className="block w-full rounded-md border-0 py-2 px-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    />
                                )}
                            />
                        </div>
                    </div>
                ))}

                <div className="border-t border-gray-200 pt-6">
                    <label className="block text-lg font-medium leading-6 text-gray-900">Redes Sociales (Opcional)</label>
                    <p className="mt-1 text-sm text-gray-600">Estos campos son opcionales.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
                        {["instagram", "facebook", "twitter"].map((field) => (
                            <div key={field}>
                                <label htmlFor={field} className="block text-sm font-medium leading-6 text-gray-900">
                                    {field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                </label>
                                <div className="mt-2">
                                    <Controller
                                        name={field as keyof FormData}
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="text"
                                                id={field.name}
                                                {...field}
                                                className="block w-full rounded-md border-0 py-2 px-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="border-t border-gray-200 pt-6">
                    <label className="block text-lg font-medium leading-6 text-gray-900">Etiquetas (Opcional)</label>
                    <p className="mt-1 text-sm text-gray-600">Estos campos son opcionales.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
                        {["etiqueta_1", "etiqueta_2", "etiqueta_3"].map((field) => (
                            <div key={field}>
                                <label htmlFor={field} className="block text-sm font-medium leading-6 text-gray-900">
                                    {field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                </label>
                                <div className="mt-2">
                                    <Controller
                                        name={field as keyof FormData}
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="text"
                                                id={field.name}
                                                {...field}
                                                className="block w-full rounded-md border-0 py-2 px-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor="comentario" className="block text-sm font-medium leading-6 text-gray-900">
                        Comentario (Opcional)
                    </label>
                    <div className="mt-2">
                        <Controller
                            name="comentario"
                            control={control}
                            render={({ field }) => (
                                <textarea
                                    id="comentario"
                                    {...field}
                                    rows={3}
                                    className="block w-full rounded-md border-0 py-2 px-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            )}
                        />
                        <p className="mt-3 text-sm leading-6 text-gray-600">Escribe aquello que estimes conveniente de este contacto.</p>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-x-6">
                <button
                    type="submit"
                    className="inline-flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-150 ease-in-out hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    {status === 'pending' ? 'Cargando...' : 'Guardar'}
                </button>
            </div>
        </form>
    );
};

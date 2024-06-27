import { PadronData } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useForm, Controller, FieldValues } from "react-hook-form";
import toast from "react-hot-toast";
import Select, { SingleValue, GroupBase, StylesConfig } from "react-select";
import { trpc } from "~/utils/api";
import { RouterInputs } from "~/utils/api";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useRutFormatter } from "~/hooks/useFormatRut";
import { tags } from "~/utils/tags";
import { communes } from "~/utils/communes";
import { regions } from "~/utils/regions";

type FormData = RouterInputs['formRouter']['submitForm'];

type SelectOption = {
    value: string;
    label: string;
};

const phonePrefixOptions: SelectOption[] = [
    { value: '+52', label: '+52' },
    { value: '+56', label: '+56' },
];

const tagOptions: SelectOption[] = tags.map(tag => ({ value: tag.value, label: tag.name }));

const communeOptions: SelectOption[] = communes.map(commune => ({ value: commune, label: commune }));

const regionOptions: SelectOption[] = regions.map(region => ({ value: region, label: region }));

const customStyles: StylesConfig<SelectOption, false> = {
    menu: (provided) => ({
        ...provided,
        zIndex: 9999,
    }),
    menuPortal: (base) => ({
        ...base,
        zIndex: 9999,
    }),
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
    const [phonePrefix, setPhonePrefix] = useState<SelectOption | null | undefined>(phonePrefixOptions[1]);
    const [phoneError, setPhoneError] = useState<string>("");
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
            const firstOption = {
                value: '0',
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

    const handlePadronDataSelect = (selectedOption: SingleValue<SelectOption> | null) => {
        setSelectedOption(selectedOption);
        if (!selectedOption) return;
        const data = padronData ? padronData[parseInt(selectedOption.value)] : null;
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

    const handlePhoneChange = (value: string) => {
        const cleanedValue = value.replace(/\D/g, "");
        if (cleanedValue.length > 9) {
            setPhoneError("El número no puede tener más de 9 dígitos.");
        } else {
            setPhoneError("");
            const formattedValue = cleanedValue.replace(/(\d{1})(\d{4})(\d{4})/, "$1 $2 $3");
            setValue("telefono", formattedValue);
        }
    };

    const validatePhone = (value: string) => {
        const cleanedValue = value.replace(/\D/g, "");
        if (cleanedValue.length < 9 && cleanedValue.length > 0) {
            setPhoneError("El número debe tener 9 dígitos.");
        } else {
            setPhoneError("");
        }
    };

    const isBrowser = typeof window !== 'undefined';

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex justify-between items-center gap-8">
                <div>
                    <h2 className="text-2xl font-semibold leading-7 text-gray-900">Ingreso de contacto</h2>
                    <p className="mt-1 text-xs md:text-sm leading-6 text-gray-600">
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
                            placeholder="12345678-9"
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
                                            value: index.toString(),
                                            label: `${data.NOMBRES ?? ''} ${data.APELLIDO_PATERNO ?? ''} ${data.APELLIDO_MATERNO ?? ''}`,
                                        }))}
                                        value={selectedOption}
                                        onChange={(option) => handlePadronDataSelect(option as SingleValue<SelectOption> | null)}
                                        styles={customStyles}
                                        className="block w-full rounded-md border-0 py-2 px-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs sm:leading-6"
                                        menuPortalTarget={isBrowser ? document.body : null}
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
                                <p><strong className="text-gray-700">RUT:</strong> {`${padronData[parseInt(selectedOption.value)]?.RUN ?? ''}-${padronData[parseInt(selectedOption.value)]?.DV ?? ''}`}</p>
                                <p><strong className="text-gray-700">Nombre Completo:</strong> {`${padronData[parseInt(selectedOption.value)]?.NOMBRES ?? ''} ${padronData[parseInt(selectedOption.value)]?.APELLIDO_PATERNO ?? ''} ${padronData[parseInt(selectedOption.value)]?.APELLIDO_MATERNO ?? ''}`}</p>
                                <p><strong className="text-gray-700">Dirección:</strong> {`${padronData[parseInt(selectedOption.value)]?.CALLE ?? ''} ${padronData[parseInt(selectedOption.value)]?.NUMERO ?? ''} ${padronData[parseInt(selectedOption.value)]?.LETRA ?? ''} ${padronData[parseInt(selectedOption.value)]?.RESTO_DOMICILIO ?? ''}`}</p>
                                <p><strong className="text-gray-700">Comuna:</strong> {padronData[parseInt(selectedOption.value)]?.GLOSACOMUNA ?? ''}</p>
                                <p><strong className="text-gray-700">Región:</strong> {padronData[parseInt(selectedOption.value)]?.GLOSAREGION ?? ''}</p>
                                <p><strong className="text-gray-700">Provincia:</strong> {padronData[parseInt(selectedOption.value)]?.GLOSAPROVINCIA ?? ''}</p>
                                <p><strong className="text-gray-700">Circunscripción:</strong> {padronData[parseInt(selectedOption.value)]?.GLOSACIRCUNSCRIPCION ?? ''}</p>
                                <p><strong className="text-gray-700">País:</strong> {padronData[parseInt(selectedOption.value)]?.GLOSAPAIS ?? ''}</p>
                                <p><strong className="text-gray-700">Mesa:</strong> {padronData[parseInt(selectedOption.value)]?.MESA ?? ''}</p>
                                <p><strong className="text-gray-700">Sexo:</strong> {padronData[parseInt(selectedOption.value)]?.SEXO === '0' ? 'Femenino' : 'Masculino' ?? ''}</p>
                            </div>
                        </div>
                    )}
                </div>

                {["nombre_completo", "direccion", "comuna", "region", "nacionalidad", "mail"].map((fieldName) => (
                    <div key={fieldName}>
                        <label htmlFor={fieldName} className="block text-sm font-medium leading-6 text-gray-900">
                            {fieldName.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </label>
                        <div className="mt-2">
                            <Controller
                                name={fieldName as keyof FormData}
                                control={control}
                                render={({ field }) => {
                                    if (fieldName === "comuna") {
                                        return (
                                            <Select
                                                {...field}
                                                options={communeOptions}
                                                value={communeOptions.find(option => option.value === field.value)}
                                                onChange={(option) => field.onChange(option ? option.value : "")}
                                                placeholder="Selecciona una comuna"
                                                styles={customStyles}
                                                className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                menuPortalTarget={isBrowser ? document.body : null}
                                            />
                                        );
                                    } else if (fieldName === "region") {
                                        return (
                                            <Select
                                                {...field}
                                                options={regionOptions}
                                                value={regionOptions.find(option => option.value === field.value)}
                                                onChange={(option) => field.onChange(option ? option.value : "")}
                                                placeholder="Selecciona una región"
                                                styles={customStyles}
                                                className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                menuPortalTarget={isBrowser ? document.body : null}
                                            />
                                        );
                                    } else {
                                        return (
                                            <input
                                                type={field.name === "mail" ? "email" : "text"}
                                                id={field.name}
                                                placeholder={
                                                    field.name === "nombre_completo" ? "Juan Pérez" :
                                                        field.name === "direccion" ? "Av. Siempre Viva 742" :
                                                            field.name === "nacionalidad" ? "Chilena" :
                                                                field.name === "mail" ? "juan.perez@example.com" : ""
                                                }
                                                {...field}
                                                className="block w-full rounded-md border-0 py-2 px-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                        );
                                    }
                                }}
                            />
                        </div>
                    </div>
                ))}

                <div className="border-t border-gray-200 pt-6">
                    <label className="block text-lg font-medium leading-6 text-gray-900">Teléfono</label>
                    <div className="mt-2 flex items-center space-x-2">
                        <Controller
                            name="telefono"
                            control={control}
                            rules={{ pattern: /^\d{9}$/ }}
                            render={({ field }) => (
                                <>
                                    <Select
                                        value={phonePrefix}
                                        onChange={(option) => setPhonePrefix(option as SelectOption)}
                                        options={phonePrefixOptions}
                                        styles={customStyles}
                                        className="w-32 text-sm"
                                        menuPortalTarget={isBrowser ? document.body : null}
                                    />
                                    <input
                                        type="tel"
                                        id="telefono"
                                        placeholder="912345678"
                                        {...field}
                                        onChange={(e) => {
                                            handlePhoneChange(e.target.value);
                                            field.onChange(e);
                                        }}
                                        onBlur={(e) => validatePhone(e.target.value)}
                                        className="block w-full rounded-md border-0 py-2 px-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    />
                                </>
                            )}
                        />
                    </div>
                    {phoneError && (
                        <p className="mt-2 text-sm text-red-600">{phoneError}</p>
                    )}
                </div>

                <div className="border-t border-gray-200 pt-6">
                    <label className="block text-lg font-medium leading-6 text-gray-900">Redes Sociales (Opcional)</label>
                    <p className="mt-1 text-sm text-gray-600">Estos campos son opcionales.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
                        {["instagram", "facebook", "twitter"].map((fieldName) => (
                            <div key={fieldName}>
                                <label htmlFor={fieldName} className="block text-sm font-medium leading-6 text-gray-900">
                                    {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
                                </label>
                                <div className="mt-2 flex items-center space-x-2">
                                    {fieldName === "facebook" ? null : <span className="text-gray-500">@</span>}
                                    <Controller
                                        name={fieldName as keyof FormData}
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="text"
                                                id={field.name}
                                                placeholder={field.name}
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
                        {["etiqueta_1", "etiqueta_2", "etiqueta_3"].map((fieldName) => (
                            <div key={fieldName}>
                                <label htmlFor={fieldName} className="block text-sm font-medium leading-6 text-gray-900">
                                    {fieldName.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                </label>
                                <div className="mt-2">
                                    <Controller
                                        name={fieldName as keyof FormData}
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                placeholder="Selecciona etiqueta"
                                                value={tagOptions.find(option => option.label === field.value)}
                                                onChange={(option) => field.onChange(option ? option.label : "")}
                                                options={tagOptions}
                                                styles={customStyles}
                                                menuPortalTarget={isBrowser ? document.body : null}
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
                                    placeholder="Escribe tus comentarios aquí..."
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

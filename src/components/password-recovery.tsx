import Link from "next/link";
import { type FC, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { trpc } from "~/utils/api";

export const PasswordRecovery: FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isResetRequested, setIsResetRequested] = useState<boolean>(false);
    const { register, handleSubmit } = useForm<{ email: string }>();
    const initiatePasswordRecovery = trpc.account.initiatePasswordRecovery.useMutation();

    const onSubmit = handleSubmit(async (data) => {
        setIsLoading(true);
        try {
            await initiatePasswordRecovery.mutateAsync(data);
            setIsResetRequested(true);
            toast.success("Se ha enviado un correo con instrucciones para restablecer tu contraseña.");
        } catch (error) {
            toast.error("Ha ocurrido un error. Por favor, inténtalo de nuevo.");
        }
        setIsLoading(false);
    });

    return (
        <section className="min-h-screen py-12 bg-gray-50 sm:py-16 lg:py-20">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="relative max-w-md mx-auto lg:max-w-lg">
                    <div className="absolute -inset-2">
                        <div
                            className="w-full h-full mx-auto rounded-3xl opacity-30 blur-lg filter"
                            style={{
                                background:
                                    "linear-gradient(90deg, #44ff9a -0.55%, #44b0ff 22.86%, #8b44ff 48.36%, #ff6644 73.33%, #ebff70 99.34%)",
                            }}
                        ></div>
                    </div>

                    <div className="relative overflow-hidden bg-white shadow-xl rounded-xl">
                        <div className="px-10 py-6 sm:px-8">
                            <div className="flex items-center justify-between gap-12 md:gap-24">
                                <h1 className="text-md w-36 font-bold text-gray-900 font-pj">
                                    Recuperar Contraseña
                                </h1>

                                <p className="text-base text-wrap text-end flex flex-col font-normal text-gray-900 font-pj">
                                    ¿Recordaste tu contraseña?{" "}
                                    <Link
                                        href="/login"
                                        className="font-bold rounded hover:underline focus:outline-none focus:ring-1 focus:ring-gray-900 focus:ring-offset-2"
                                    >
                                        Inicia sesión
                                    </Link>
                                </p>
                            </div>

                            {!isResetRequested ? (
                                <form onSubmit={onSubmit} className="mt-12">
                                    <div className="space-y-4">
                                        <div>
                                            <label
                                                htmlFor="email"
                                                className="text-base font-medium text-gray-900 font-pj"
                                            >
                                                Email
                                            </label>
                                            <div className="mt-2.5">
                                                <input
                                                    {...register("email")}
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    autoComplete="email"
                                                    required
                                                    placeholder="Dirección Email"
                                                    className="block w-full px-4 py-4 text-gray-900 placeholder-gray-600 bg-white border border-gray-400 rounded-xl focus:border-gray-900 focus:ring-gray-900 caret-gray-900"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="flex items-center justify-center w-full px-8 py-4 mt-8 text-base font-bold text-white transition-all duration-200 bg-gray-900 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 font-pj hover:bg-gray-600"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
                                    </button>
                                </form>
                            ) : (
                                <div className="mt-12 text-center">
                                    <p className="text-base font-medium text-gray-900 font-pj">
                                        Se ha enviado un correo con instrucciones para restablecer tu contraseña.
                                        Por favor, revisa tu bandeja de entrada.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { type z } from "zod";
import { type signupSchema } from "~/schemas/signupSchema";

type formType = z.infer<typeof signupSchema>;

export function Signup() {
    const { register, handleSubmit, watch } = useForm<formType>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();

    const onSubmit = handleSubmit(async (signupData) => {
        setIsLoading(true);
        const result = await signIn("credentials", {
            ...signupData,
            redirect: false,
            callbackUrl: "/app",
        });

        if (result?.ok) {
            toast.success("Ingreso Exitoso");
            router.push(result.url ?? "/app");
        } else {
            toast.error("Error en las credenciales. Inténtalo de nuevo.");
        }
        setIsLoading(false);
    });

    console.log(watch());

    return (
        <section className="py-12 bg-gray-50 sm:py-16 lg:py-20">
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
                                    Regístrate
                                </h1>

                                <p className="text-base text-wrap text-end flex flex-col font-normal text-gray-900 font-pj">
                                    ¿Ya tienes cuenta?{" "}
                                    <Link
                                        href="/login"
                                        className="font-bold rounded hover:underline focus:outline-none focus:ring-1 focus:ring-gray-900 focus:ring-offset-2"
                                    >
                                        Ingresa
                                    </Link>
                                </p>
                            </div>

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

                                    <div>
                                        <div className="flex items-center justify-between">
                                            <label
                                                htmlFor="password"
                                                className="text-base font-medium text-gray-900 font-pj"
                                            >
                                                Contraseña
                                            </label>
                                        </div>
                                        <div className="mt-2.5">
                                            <input
                                                {...register("password")}
                                                id="password"
                                                name="password"
                                                type="password"
                                                autoComplete="current-password"
                                                required
                                                placeholder="Password (min. 8 caracteres)"
                                                className="block w-full px-4 py-4 text-gray-900 placeholder-gray-600 bg-white border border-gray-400 rounded-xl focus:border-gray-900 focus:ring-gray-900 caret-gray-900"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between mt-4">
                                            <label
                                                htmlFor="confirmPassword"
                                                className="text-base font-medium text-gray-900 font-pj"
                                            >
                                                Repetir Contraseña
                                            </label>
                                        </div>
                                        <div className="mt-2.5">
                                            <input
                                                {...register("confirmPassword")}
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type="password"
                                                autoComplete="current-password"
                                                required
                                                placeholder="Confirmar Password"
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
                                    {isLoading ? "Cargando..." : "Registrarse"}
                                </button>
                            </form>

                            <svg
                                className="w-auto h-4 mx-auto mt-8 text-gray-300"
                                viewBox="0 0 172 16"
                                fill="none"
                                stroke="currentColor"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                {/* SVG lines */}
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
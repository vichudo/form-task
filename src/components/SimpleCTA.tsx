
import { XCircleIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import React, { type FC } from 'react';

export const SimpleCTA: FC = () => {
    const { status } = useSession()
    return (
        <section className="py-10 bg-white sm:py-16 lg:py-24">
            <div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="flex items-center justify-center">
                        <div className="w-20 h-20 -mr-6 overflow-hidden bg-gray-300 rounded-full">
                            <img className="object-cover w-full h-full" src="https://cdn.rareblocks.xyz/collection/celebration/images/cta/2/female-avatar-1.jpg" alt="" />
                        </div>

                        <div className="relative overflow-hidden bg-gray-300 border-8 border-white rounded-full w-28 h-28">
                            <img className="object-cover w-full h-full" src="https://cdn.rareblocks.xyz/collection/celebration/images/cta/2/male-avatar-1.jpg" alt="" />
                        </div>

                        <div className="w-20 h-20 -ml-6 overflow-hidden bg-gray-300 rounded-full">
                            <img className="object-cover w-full h-full" src="https://cdn.rareblocks.xyz/collection/celebration/images/cta/2/female-avatar-2.jpg" alt="" />
                        </div>
                    </div>

                    <h2 className="mt-8 text-3xl font-bold leading-tight text-black lg:mt-12 sm:text-4xl lg:text-5xl">Registra tus contactos</h2>
                    <p className="max-w-xl mx-auto mt-6 text-xl text-gray-600 md:mt-10">Ingresa y gestiona tus contactos rápidamente</p>

                    <div className='flex gap-2 items-center justify-center'>
                        <Link href="/app" title="" className="inline-flex items-center justify-center px-4 py-4 mt-8 font-semibold text-white transition-all duration-200 bg-blue-600 border border-transparent rounded-md lg:mt-12 hover:bg-blue-700 focus:bg-blue-700" role="button">
                            <ComputerDesktopIcon className="w-5 h-5 mr-2 -ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" />
                            Ir a App
                        </Link>
                        {
                            status === 'authenticated' &&
                            <button onClick={() => signOut()} className="inline-flex items-center justify-center px-4 py-4 mt-8 font-semibold text-red-100 transition-all duration-200 bg-red-600 border border-transparent rounded-md lg:mt-12 hover:bg-red-700 focus:bg-red-700" role="button">
                                <XCircleIcon className="w-5 h-5 mr-2 -ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </XCircleIcon>
                                Cerrar Sesión
                            </button>
                        }
                    </div>
                </div>
            </div>
        </section >
    );
}

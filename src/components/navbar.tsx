'use client'

import { type FC, Fragment } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'


const navigation = [
    { name: 'Contactos', href: '/app' },
    { name: 'Formulario', href: '/form' },
]

export const Navbar: FC = () => {
    const { data: session } = useSession()
    const router = useRouter()

    return (
        <Popover as="header" className="relative">
            <div className="bg-gray-100 py-6">
                <nav
                    className="relative mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6"
                    aria-label="Global">
                    {/* <Link href={'/'} className="flex items-center drop-shadow-lg">
                        <Image
                            height={100}
                            width={100}
                            className="h-8 w-auto sm:h-10 mr-4"
                            src={payscriptLogoImage}
                            alt="Reccupera logo"
                        />
                        <span className="font-bold text-indigo-600 ">Reccupera</span>
                    </Link> */}

                    <div className="flex items-center">
                        <div className="flex w-full items-center justify-between md:w-auto">
                            <div className="-mr-2 flex items-center md:hidden">
                                <Popover.Button className="focus-ring-inset inline-flex items-center justify-center rounded-md  p-2 text-gray-500 hover:text-gray-800 focus:outline-none ">
                                    <span className="sr-only">Abrir menú</span>
                                    <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                                </Popover.Button>
                            </div>
                        </div>
                        <div className="hidden space-x-8 md:ml-10 md:flex">
                            {navigation.map(item => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="text-base font-medium text-gray-700 hover:text-gray-900">
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {session ? (
                        <div className="hidden md:flex md:items-center md:space-x-8">
                            {/* <Link
                                href="/app/dashboard"
                                className="block rounded-md bg-indigo-600 py-2 px-3 text-center  font-medium text-white shadow hover:bg-indigo-700">
                                Ir a App
                            </Link> */}
                            <button
                                onClick={() => signOut().then(() => router.push('/login'))}
                                className="block items-center rounded-md border border-transparent font-medium  bg-gray-200 px-4 py-2 text-base text-red-500 hover:bg-red-100">
                                Log out
                            </button>
                        </div>
                    ) : (
                        <div className="hidden md:flex md:items-center md:space-x-6">
                            <Link
                                href="/login"
                                className="text-base font-medium text-indigo-600 hover:text-indigo-500">
                                Iniciar sesión
                            </Link>
                            <Link
                                href="/signup"
                                className="inline-flex items-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-base font-medium text-white hover:bg-gray-700">
                                Crear cuenta
                            </Link>
                        </div>
                    )}
                </nav>
            </div>

            <Transition
                as={Fragment}
                enter="duration-150 ease-out"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="duration-100 ease-in"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95">
                <Popover.Panel
                    focus
                    className="absolute inset-x-0 top-0 z-10 origin-top transform p-2 transition md:hidden">
                    <div className="overflow-hidden rounded-lg bg-white shadow-md ring-1 ring-black ring-opacity-5">
                        <div className="flex items-center justify-between px-5 pt-4">
                            <div>
                                {/* <Image
                                    height={100}
                                    width={100}
                                    className="h-10 w-auto"
                                    src={payscriptLogoImage}
                                    alt="Reccupera logo"
                                /> */}
                            </div>
                            <div className="-mr-2">
                                <Popover.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600">
                                    <span className="sr-only">Cerrar menú</span>
                                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                </Popover.Button>
                            </div>
                        </div>
                        <div className="pt-5 pb-6">
                            <div className="space-y-1 px-2">
                                {navigation.map(item => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50">
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                            {/* <div className="mt-6 px-5">
                                {session ? (
                                    <Link
                                        href="/app/dashboard"
                                        className="block w-full rounded-md bg-indigo-600 py-3 px-4 text-center font-medium text-white shadow hover:bg-indigo-700">
                                        Dashboard
                                    </Link>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="block w-full rounded-md bg-indigo-600 py-3 px-4 text-center font-medium text-white shadow hover:bg-indigo-700">
                                        Empieza
                                    </Link>
                                )}
                            </div> */}
                            <div className="mt-6 px-5">
                                {session ? (
                                    <p className="text-center text-base font-medium text-gray-500">
                                        <button
                                            onClick={() => signOut()}
                                            className="text-red-600 hover:underline">
                                            Log Out
                                        </button>
                                    </p>
                                ) : (
                                    <p className="text-center text-base font-medium text-gray-500">
                                        ¿Ya eres cliente?{' '}
                                        <Link
                                            href="/login"
                                            className="text-gray-900 hover:underline">
                                            Login
                                        </Link>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </Popover.Panel>
            </Transition>
        </Popover>
    )
}

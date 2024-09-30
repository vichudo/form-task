import React, { type FC } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { HomeIcon, EnvelopeIcon, ArrowUpOnSquareIcon } from '@heroicons/react/24/outline';

interface AdminNavigationProps {
    className?: string;
}

export const AdminNavigation: FC<AdminNavigationProps> = ({ className = '' }) => {
    const router = useRouter();
    const navItems = [
        { href: '/admin', icon: HomeIcon, label: 'Vista Admin' },
        { href: '/admin/sms', icon: EnvelopeIcon, label: 'Panel de Solicitudes SMS' },
        { href: '/admin/importador', icon: ArrowUpOnSquareIcon, label: 'Importar Contactos' },
        // { href: '/admin/ver-contactos', icon: ArrowUpOnSquareIcon, label: 'Ver Contactos por usuario' }, TODO
    ];

    return (
        <nav className={`p-2 rounded-xl mb-8 ${className}`}>
            <div className={`rounded-lg p-3 ${className}`}>
                <ul className="flex flex-wrap justify-center gap-3">
                    {navItems.map((item, index) => {
                        const isActive = router.pathname === item.href;
                        return (
                            <li key={index}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center px-4 py-2 rounded-md transition-all duration-200 ${isActive
                                        ? 'bg-indigo-50 text-indigo-700 shadow-md'
                                        : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 border border-gray-200 hover:border-indigo-300 hover:shadow-md'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5 mr-2" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </nav>
    );
};
import { useEffect, useState } from "react";

export const useRutFormatter = (rut: string) => {
    const [formattedRut, setFormattedRut] = useState(rut);

    useEffect(() => {
        const formatRut = (rut: string) => {
            const cleanRut = rut.replace(/[^0-9kK]/g, ''); // Remove all non-numeric characters except 'k' or 'K'
            if (cleanRut.length <= 1) return cleanRut;
            const body = cleanRut.slice(0, -1);
            const verifier = cleanRut.slice(-1);
            return `${body}-${verifier.toUpperCase()}`;
        };

        setFormattedRut(formatRut(rut));
    }, [rut]);

    return formattedRut;
};

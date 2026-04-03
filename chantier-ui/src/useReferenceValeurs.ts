import { useEffect, useState } from 'react';
import api from './api.ts';

export function useReferenceValeurs(type: string) {
    const [options, setOptions] = useState<{ text: string; value: string; label: string }[]>([]);

    useEffect(() => {
        api.get(`/reference-valeurs?type=${encodeURIComponent(type)}`)
            .then(res => {
                setOptions(res.data.map((d: any) => ({ text: d.valeur, value: d.valeur, label: d.valeur })));
            })
            .catch(() => setOptions([]));
    }, [type]);

    return options;
}

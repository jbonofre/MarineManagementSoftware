import { useEffect, useState } from 'react';

export default function useIsMobile(breakpoint = 768): boolean {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);

    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth < breakpoint);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, [breakpoint]);

    return isMobile;
}

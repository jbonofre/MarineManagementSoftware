import React, { createContext, useContext } from 'react';

interface NavigationContextType {
    navigate: (page: string, state?: any) => void;
    pageState: any;
}

export const NavigationContext = createContext<NavigationContextType>({
    navigate: () => {},
    pageState: null,
});

export function useNavigation() {
    return useContext(NavigationContext);
}

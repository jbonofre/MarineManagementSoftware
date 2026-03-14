import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './app.tsx';

// Mock child components
jest.mock('./login.tsx', () => {
    return function MockLogin({ setUser }: any) {
        return (
            <div data-testid="login-component">
                <button onClick={() => setUser({ id: 1, nom: 'Leclerc', prenom: 'Pierre' })}>
                    Se connecter
                </button>
            </div>
        );
    };
});

jest.mock('./planning.tsx', () => {
    return function MockPlanning({ technicienId }: any) {
        return <div data-testid="planning-component">Planning: {technicienId}</div>;
    };
});

jest.mock('./mobile-app.tsx', () => {
    return function MockMobileApp() {
        return <div data-testid="mobile-app">Mobile</div>;
    };
});

jest.mock('./use-is-mobile.tsx', () => {
    return () => false;
});

describe('App', () => {
    it('renders login when no user is set', () => {
        render(<App />);
        expect(screen.getByTestId('login-component')).toBeInTheDocument();
    });

    it('renders workspace after login', () => {
        render(<App />);
        act(() => {
            screen.getByText('Se connecter').click();
        });
        expect(screen.getByText(/Pierre Leclerc/)).toBeInTheDocument();
        expect(screen.getByText('Deconnexion')).toBeInTheDocument();
    });
});

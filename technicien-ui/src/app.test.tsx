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
    return function MockMobileApp({ onChangePassword }: any) {
        return (
            <div data-testid="mobile-app">
                <button onClick={onChangePassword}>Changer mot de passe mobile</button>
            </div>
        );
    };
});

jest.mock('./change-password-modal.tsx', () => {
    return function MockChangePasswordModal({ open, onClose, technicienId }: any) {
        if (!open) return null;
        return (
            <div data-testid="change-password-modal">
                Change password for {technicienId}
                <button onClick={onClose}>Fermer</button>
            </div>
        );
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

    it('shows password change button after login', () => {
        render(<App />);
        act(() => {
            screen.getByText('Se connecter').click();
        });
        expect(screen.getByText('Mot de passe')).toBeInTheDocument();
    });

    it('opens password change modal when button is clicked', () => {
        render(<App />);
        act(() => {
            screen.getByText('Se connecter').click();
        });
        expect(screen.queryByTestId('change-password-modal')).not.toBeInTheDocument();
        act(() => {
            screen.getByText('Mot de passe').click();
        });
        expect(screen.getByTestId('change-password-modal')).toBeInTheDocument();
    });

    it('closes password change modal', () => {
        render(<App />);
        act(() => {
            screen.getByText('Se connecter').click();
        });
        act(() => {
            screen.getByText('Mot de passe').click();
        });
        expect(screen.getByTestId('change-password-modal')).toBeInTheDocument();
        act(() => {
            screen.getByText('Fermer').click();
        });
        expect(screen.queryByTestId('change-password-modal')).not.toBeInTheDocument();
    });
});

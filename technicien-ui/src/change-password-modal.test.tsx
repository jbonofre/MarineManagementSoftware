import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ChangePasswordModal from './change-password-modal.tsx';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// antd responsiveObserver requires window.matchMedia to return a valid MediaQueryList.
// This must be set before any antd component renders and must survive jest.clearAllMocks().
const matchMediaImpl = (query: string) => ({
    matches: false,
    media: query,
    onchange: null as any,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
});

window.matchMedia = matchMediaImpl as any;

describe('ChangePasswordModal', () => {
    const onClose = jest.fn();

    beforeEach(() => {
        onClose.mockClear();
        mockedAxios.post.mockClear();
        // re-assign matchMedia in case clearAllMocks wiped it
        window.matchMedia = matchMediaImpl as any;
    });

    it('renders the modal when open', async () => {
        await act(async () => {
            render(<ChangePasswordModal technicienId={100} open={true} onClose={onClose} />);
        });
        expect(screen.getByText('Changer le mot de passe')).toBeInTheDocument();
    });

    it('does not render when closed', async () => {
        await act(async () => {
            render(<ChangePasswordModal technicienId={100} open={false} onClose={onClose} />);
        });
        expect(screen.queryByText('Changer le mot de passe')).not.toBeInTheDocument();
    });

    it('calls API and closes on successful password change', async () => {
        mockedAxios.post.mockResolvedValueOnce({ data: null, status: 204 });
        await act(async () => {
            render(<ChangePasswordModal technicienId={100} open={true} onClose={onClose} />);
        });

        const passwordInputs = document.querySelectorAll('input[type="password"]');
        expect(passwordInputs.length).toBe(3);

        await userEvent.type(passwordInputs[0] as HTMLElement, 'oldpass');
        await userEvent.type(passwordInputs[1] as HTMLElement, 'newpass123');
        await userEvent.type(passwordInputs[2] as HTMLElement, 'newpass123');

        await act(async () => {
            screen.getByText('Confirmer').click();
        });

        await waitFor(() => {
            expect(mockedAxios.post).toHaveBeenCalledWith('/technicien-portal/change-password', {
                technicienId: 100,
                currentPassword: 'oldpass',
                newPassword: 'newpass123',
            });
            expect(onClose).toHaveBeenCalled();
        });
    });

    it('does not call API when passwords do not match', async () => {
        await act(async () => {
            render(<ChangePasswordModal technicienId={100} open={true} onClose={onClose} />);
        });

        const passwordInputs = document.querySelectorAll('input[type="password"]');

        await userEvent.type(passwordInputs[1] as HTMLElement, 'newpass123');
        await userEvent.type(passwordInputs[2] as HTMLElement, 'different');

        await act(async () => {
            screen.getByText('Confirmer').click();
        });

        await waitFor(() => {
            expect(onClose).not.toHaveBeenCalled();
        });
    });

    it('shows error on API failure', async () => {
        mockedAxios.post.mockRejectedValueOnce(new Error('Unauthorized'));
        await act(async () => {
            render(<ChangePasswordModal technicienId={100} open={true} onClose={onClose} />);
        });

        const passwordInputs = document.querySelectorAll('input[type="password"]');

        await userEvent.type(passwordInputs[0] as HTMLElement, 'wrong');
        await userEvent.type(passwordInputs[1] as HTMLElement, 'newpass123');
        await userEvent.type(passwordInputs[2] as HTMLElement, 'newpass123');

        await act(async () => {
            screen.getByText('Confirmer').click();
        });

        await waitFor(() => {
            expect(mockedAxios.post).toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
        });
    });

    it('calls onClose when cancel is clicked', async () => {
        await act(async () => {
            render(<ChangePasswordModal technicienId={100} open={true} onClose={onClose} />);
        });
        await act(async () => {
            screen.getByText('Annuler').click();
        });
        expect(onClose).toHaveBeenCalled();
    });
});

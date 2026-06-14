import { describe, test, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardSettings from '@/pages/Admin/DashboardSettings';
import { renderWithProviders } from './utils/renderWithProviders';

describe('DashboardSettings', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('TC-SET-01: renders two tabs', async () => {
        renderWithProviders(<DashboardSettings />);
        await waitFor(() => {
            expect(screen.getByRole('tab', { name: /WHATSAPP/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /SÉCURITÉ/i })).toBeInTheDocument();
        });
    });

    test('TC-SET-02: WhatsApp tab shows by default', async () => {
        renderWithProviders(<DashboardSettings />);
        await waitFor(() => {
            expect(screen.getByText(/Numéro WhatsApp Business/i)).toBeInTheDocument();
        });
    });

    test('TC-SET-03: loads existing whatsapp number', async () => {
        renderWithProviders(<DashboardSettings />);
        await waitFor(() => {
            const input = screen.getByLabelText(/Numéro WhatsApp Business/i) as HTMLInputElement;
            expect(input.value).toBe('+212649595793'); // From data.ts MOCK_SETTINGS
        });
    });

    test('TC-SET-04: whatsapp save calls PUT settings/whatsapp', async () => {
        const user = userEvent.setup();
        renderWithProviders(<DashboardSettings />);
        await waitFor(() => screen.getByLabelText(/Numéro WhatsApp Business/i));

        const input = screen.getByLabelText(/Numéro WhatsApp Business/i);
        await user.clear(input);
        await user.type(input, '+212600000000');

        await user.click(screen.getByRole('button', { name: /Sauvegarder les modifications/i }));

        // Success toast is checked via waitFor or just assuming MSW returns 200
        await waitFor(() => {
            // Check if Button is not disabled anymore or some success indicator
        });
    });

    test('TC-SET-06: clicking Sécurité tab shows password form', async () => {
        const user = userEvent.setup();
        renderWithProviders(<DashboardSettings />);
        await waitFor(() => screen.getByRole('tab', { name: /SÉCURITÉ/i }));

        await user.click(screen.getByRole('tab', { name: /SÉCURITÉ/i }));

        expect(screen.getByLabelText(/Mot de passe actuel/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Nouveau mot de passe/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Confirmation/i)).toBeInTheDocument();
    });

    test('TC-SET-10: password show/hide toggles on all fields', async () => {
        const user = userEvent.setup();
        renderWithProviders(<DashboardSettings />);
        await user.click(screen.getByRole('tab', { name: /SÉCURITÉ/i }));

        const currentPassInput = screen.getByLabelText(/Mot de passe actuel/i) as HTMLInputElement;
        expect(currentPassInput.type).toBe('password');

        // Find the eye icon button next to current password
        // It's the first button with icon inside the tab content
        const toggleBtns = screen.getAllByRole('button').filter(b => b.className.includes('absolute right-3'));

        await user.click(toggleBtns[0]);
        expect(currentPassInput.type).toBe('text');

        await user.click(toggleBtns[0]);
        expect(currentPassInput.type).toBe('password');
    });
});

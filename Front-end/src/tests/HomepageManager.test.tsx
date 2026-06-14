import { describe, test, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomepageManager from '@/pages/Admin/HomepageManager';
import { renderWithProviders } from './utils/renderWithProviders';

describe('HomepageManager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('TC-HOME-01: renders all 4 tabs', async () => {
        renderWithProviders(<HomepageManager />);
        await waitFor(() => {
            expect(screen.getByRole('tab', { name: /HERO SECTION/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /OFFRE EXCLUSIVE/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /GALERIE VITRINE/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /BLACK FRIDAY/i })).toBeInTheDocument();
        });
    });

    // ── HERO SECTION ─────────────────────────────────────
    test('TC-HOME-02: loads and displays hero slides', async () => {
        renderWithProviders(<HomepageManager />);
        await waitFor(() => {
            expect(screen.getByText('Slide 1')).toBeInTheDocument();
        });
    });

    test('TC-HOME-03: hero form fields are present', async () => {
        renderWithProviders(<HomepageManager />);
        await waitFor(() => {
            expect(screen.getByPlaceholderText(/EX: NOUVELLE COLLECTION/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Ordre/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Sous-titre/i)).toBeInTheDocument();
        });
    });

    // ── EXCLUSIVE OFFER ──────────────────────────────────
    test('TC-HOME-05: loads promo configuration', async () => {
        const user = userEvent.setup();
        renderWithProviders(<HomepageManager />);
        await user.click(screen.getByRole('tab', { name: /OFFRE EXCLUSIVE/i }));

        await waitFor(() => {
            expect(screen.getByDisplayValue('Offre de Bienvenue')).toBeInTheDocument();
        });
    });

    // ── GALLERY ──────────────────────────────────────────
    test('TC-HOME-08: renders 5 slots in gallery tab', async () => {
        const user = userEvent.setup();
        renderWithProviders(<HomepageManager />);
        await user.click(screen.getByRole('tab', { name: /GALERIE VITRINE/i }));

        await waitFor(() => {
            expect(screen.getByText('SLOT 1')).toBeInTheDocument();
            expect(screen.getByText('SLOT 2')).toBeInTheDocument();
            expect(screen.getByText('SLOT 3')).toBeInTheDocument();
            expect(screen.getByText('SLOT 4')).toBeInTheDocument();
            expect(screen.getByText('SLOT 5')).toBeInTheDocument();
        });
    });

    // ── BLACK FRIDAY ─────────────────────────────────────
    test('TC-HOME-12: loads black friday config', async () => {
        const user = userEvent.setup();
        renderWithProviders(<HomepageManager />);
        await user.click(screen.getByRole('tab', { name: /BLACK FRIDAY/i }));

        await waitFor(() => {
            expect(screen.getByDisplayValue('🔥')).toBeInTheDocument();
            expect(screen.getByDisplayValue('BLACK')).toBeInTheDocument();
            expect(screen.getByDisplayValue('FRIDAY')).toBeInTheDocument();
            expect(screen.getByDisplayValue('SOLDES FOLES')).toBeInTheDocument();
        });
    });

    test('TC-HOME-13: black friday preview updates in real-time', async () => {
        const user = userEvent.setup();
        renderWithProviders(<HomepageManager />);
        await user.click(screen.getByRole('tab', { name: /BLACK FRIDAY/i }));

        const line1Input = screen.getByLabelText(/Ligne 1/i);
        await user.clear(line1Input);
        await user.type(line1Input, 'CYBER');

        // Preview section
        const preview = screen.getByText(/APERÇU EN TEMPS RÉEL/i).closest('div')?.parentElement;
        expect(within(preview!).getByText('CYBER')).toBeInTheDocument();
    });
});

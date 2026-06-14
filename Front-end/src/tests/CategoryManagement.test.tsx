import { describe, test, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CategoryManagement from '@/pages/Admin/CategoryManagement';
import { renderWithProviders } from './utils/renderWithProviders';

describe('CategoryManagement', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('TC-CAT-01: renders 3 column layout', async () => {
        renderWithProviders(<CategoryManagement />);
        await waitFor(() => {
            expect(screen.getByText(/1. Cibles/i)).toBeInTheDocument();
            expect(screen.getByText(/2. Modèles/i)).toBeInTheDocument();
            expect(screen.getByText(/3. Palette de Couleurs/i)).toBeInTheDocument();
        });
    });

    test('TC-CAT-02: loads and displays cibles', async () => {
        renderWithProviders(<CategoryManagement />);
        await waitFor(() => {
            expect(screen.getByText('Hommes')).toBeInTheDocument();
            expect(screen.getByText('Femmes')).toBeInTheDocument();
            expect(screen.getByText('Enfants')).toBeInTheDocument();
        });
    });

    test('TC-CAT-03: clicking cible selects it and shows types', async () => {
        const user = userEvent.setup();
        renderWithProviders(<CategoryManagement />);
        await waitFor(() => screen.getByText('Hommes'));

        await user.click(screen.getByText('Hommes'));

        // Check if "Hommes" is active (it gets orange color)
        const hommesDiv = screen.getByText('Hommes').closest('div');
        // Since we check for "Sneakers" which is a sub-category of Hommes in mock data
        await waitFor(() => {
            expect(screen.getByText('Sneakers')).toBeInTheDocument();
        });
    });

    test('TC-CAT-04: clicking type shows its colors', async () => {
        const user = userEvent.setup();
        renderWithProviders(<CategoryManagement />);
        await waitFor(() => screen.getByText('Hommes'));

        await user.click(screen.getByText('Hommes'));
        await waitFor(() => screen.getByText('Sneakers'));
        await user.click(screen.getByText('Sneakers'));

        await waitFor(() => {
            expect(screen.getByText('Noir')).toBeInTheDocument();
            expect(screen.getByText('Blanc')).toBeInTheDocument();
            expect(screen.getByText('Rouge Hermado')).toBeInTheDocument();
        });
    });

    test('TC-CAT-05: type column overlay shows when no cible selected', async () => {
        renderWithProviders(<CategoryManagement />);
        await waitFor(() => screen.getByText(/1. Cibles/i));
        expect(screen.getByText(/SÉLECTIONNEZ UNE CIBLE/i)).toBeInTheDocument();
    });

    test('TC-CAT-07: add cible modal opens on button click', async () => {
        const user = userEvent.setup();
        renderWithProviders(<CategoryManagement />);
        await waitFor(() => screen.getByText(/Nouvelle Cible/i));

        await user.click(screen.getByText(/Nouvelle Cible/i));

        expect(screen.getByText(/AJOUTER UNE CIBLE/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/NOM DU MODÈLE/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/الاسم باللغة العربية/i)).toBeInTheDocument();
    });

    test('TC-CAT-11: VALIDER button disabled when input empty', async () => {
        const user = userEvent.setup();
        renderWithProviders(<CategoryManagement />);
        await waitFor(() => screen.getByText(/Nouvelle Cible/i));
        await user.click(screen.getByText(/Nouvelle Cible/i));

        const validateBtn = screen.getByRole('button', { name: /VALIDER/i });
        expect(validateBtn).toBeDisabled();

        await user.type(screen.getByLabelText(/NOM DU MODÈLE/i), 'Unisexe');
        expect(validateBtn).toBeEnabled();
    });

    test('TC-CAT-13: delete cible shows confirm modal', async () => {
        const user = userEvent.setup();
        renderWithProviders(<CategoryManagement />);
        await waitFor(() => screen.getByText('Hommes'));

        const hommesRow = screen.getByText('Hommes').closest('div')?.parentElement;
        const deleteBtn = within(hommesRow!).getByRole('button'); // X icon button

        await user.click(deleteBtn);

        expect(screen.getByText(/SUPPRIMER CONFIRMATION/i)).toBeInTheDocument();
        expect(screen.getByText('Hommes')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /CONFIRMER/i })).toBeInTheDocument();
    });
});

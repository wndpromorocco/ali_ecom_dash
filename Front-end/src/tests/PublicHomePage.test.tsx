import { describe, test, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import HomePage from '@/pages/Home';
import { renderWithProviders } from './utils/renderWithProviders';

describe('PublicHomePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('TC-PUB-01: renders hero section with dynamic slides', async () => {
        renderWithProviders(<HomePage />);
        await waitFor(() => {
            expect(screen.getByText('Slide 1')).toBeInTheDocument();
            expect(screen.getByText('Subtitle 1')).toBeInTheDocument();
        });
    });

    test('TC-PUB-02: renders features bar', async () => {
        renderWithProviders(<HomePage />);
        expect(screen.getByText(/Livraison Gratuite/i)).toBeInTheDocument();
        expect(screen.getByText(/Politique de Retour/i)).toBeInTheDocument();
        expect(screen.getByText(/Assistance 24\/7/i)).toBeInTheDocument();
        expect(screen.getByText(/Paiement Sécurisé/i)).toBeInTheDocument();
    });

    test('TC-PUB-03: renders gallery grid with black friday card', async () => {
        renderWithProviders(<HomePage />);
        await waitFor(() => {
            expect(screen.getByText('BLACK')).toBeInTheDocument();
            expect(screen.getByText('FRIDAY')).toBeInTheDocument();
            expect(screen.getByText('SOLDES FOLES')).toBeInTheDocument();
        });
    });

    test('TC-PUB-04: loads and displays latest products', async () => {
        renderWithProviders(<HomePage />);
        await waitFor(() => {
            expect(screen.getByText(/Derniers Produits/i)).toBeInTheDocument();
            expect(screen.getByText('Nike Air Max 270')).toBeInTheDocument();
            expect(screen.getByText('Adidas Ultraboost 22')).toBeInTheDocument();
        });
    });

    test('TC-PUB-05: renders hot deal section with countdown', async () => {
        renderWithProviders(<HomePage />);
        await waitFor(() => {
            expect(screen.getByText('Offre de Bienvenue')).toBeInTheDocument();
            expect(screen.getByText(/Jours/i)).toBeInTheDocument();
            expect(screen.getByText(/Heures/i)).toBeInTheDocument();
        });
    });

    test('TC-PUB-06: renders brands strip', () => {
        renderWithProviders(<HomePage />);
        // Use getAllByText as these might appear in product names too
        expect(screen.getAllByText('Nike')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Adidas')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Puma')[0]).toBeInTheDocument();
    });

    test('TC-PUB-07: renders instagram section', () => {
        renderWithProviders(<HomePage />);
        expect(screen.getByText(/SUIVEZ-NOUS SUR INSTAGRAM/i)).toBeInTheDocument();
        expect(screen.getByText(/@hermado.shoes/i)).toBeInTheDocument();
    });
});

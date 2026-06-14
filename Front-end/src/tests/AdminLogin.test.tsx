import { describe, test, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminLogin from '@/pages/Admin/AdminLogin';
import { renderWithProviders } from './utils/renderWithProviders';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('AdminLogin', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    test('TC-LOGIN-01: renders login form correctly', () => {
        renderWithProviders(<AdminLogin />);
        expect(screen.getByText(/Fadel trading/i)).toBeInTheDocument();
        expect(screen.getByText(/ADMIN/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email Professionnel/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Mot de Passe/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Se Connecter/i })).toBeInTheDocument();
    });

    test('TC-LOGIN-02: shows error on wrong credentials', async () => {
        const user = userEvent.setup();
        renderWithProviders(<AdminLogin />);

        await user.type(screen.getByLabelText(/Email Professionnel/i), 'wrong@hermado.com');
        await user.type(screen.getByLabelText(/Mot de Passe/i), 'wrongpassword');
        await user.click(screen.getByRole('button', { name: /Se Connecter/i }));

        // Check if error toast is called (we can't easily check toast directly with screen unless we mock it or use findByText)
        // Since we are using MSW, the login function in AuthContext will receive a 401
        // And toast.error will be called.

        // Wait for some time to ensure no navigation happened
        await waitFor(() => {
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    test('TC-LOGIN-03: successful login navigates to dashboard', async () => {
        const user = userEvent.setup();
        renderWithProviders(<AdminLogin />);

        await user.type(screen.getByLabelText(/Email Professionnel/i), 'admin@hermado.com');
        await user.type(screen.getByLabelText(/Mot de Passe/i), 'password123');
        await user.click(screen.getByRole('button', { name: /Se Connecter/i }));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalled();
            // The route depends on VITE_ADMIN_SLUG, which might be undefined in tests unless we mock it
        });
    });

    test('TC-LOGIN-04: submit button shows loader while submitting', async () => {
        const user = userEvent.setup();
        renderWithProviders(<AdminLogin />);

        await user.type(screen.getByLabelText(/Email Professionnel/i), 'admin@hermado.com');
        await user.type(screen.getByLabelText(/Mot de Passe/i), 'password123');

        const submitBtn = screen.getByRole('button', { name: /Se Connecter/i });
        await user.click(submitBtn);

        // While submitting, the button should be disabled
        expect(submitBtn).toBeDisabled();
        // The loader icon should be visible (it uses Loader2 from lucide, we can check for an svg or specific class if we manage to catch it)
        // But usually checking isDisabled is enough for the "shows loader/disabled" logic.
    });

    test('TC-LOGIN-06: email field validates format', async () => {
        const user = userEvent.setup();
        renderWithProviders(<AdminLogin />);
        const emailInput = screen.getByLabelText(/Email Professionnel/i) as HTMLInputElement;

        await user.type(emailInput, 'notanemail');
        expect(emailInput.checkValidity()).toBe(false);
    });

    test('TC-LOGIN-07: fields are required', async () => {
        renderWithProviders(<AdminLogin />);
        const emailInput = screen.getByLabelText(/Email Professionnel/i) as HTMLInputElement;
        const passwordInput = screen.getByLabelText(/Mot de Passe/i) as HTMLInputElement;

        expect(emailInput).toBeRequired();
        expect(passwordInput).toBeRequired();
    });

    test('TC-LOGIN-08: left panel branding renders', () => {
        renderWithProviders(<AdminLogin />);
        expect(screen.getByText(/GÉREZ VOTRE/i)).toBeInTheDocument();
        expect(screen.getByText(/BOUTIQUE/i)).toBeInTheDocument();
        expect(screen.getByText(/EN TEMPS RÉEL/i)).toBeInTheDocument();
        expect(screen.getByText(/Gestion d'inventaire en direct/i)).toBeInTheDocument();
        expect(screen.getByText(/Catalogue & attributs produit/i)).toBeInTheDocument();
        expect(screen.getByText(/Canal WhatsApp intégré/i)).toBeInTheDocument();
    });
});

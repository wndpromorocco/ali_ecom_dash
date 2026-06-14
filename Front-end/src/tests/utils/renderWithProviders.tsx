import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';

export const renderWithProviders = (
    ui: React.ReactElement,
    { route = '/' } = {}
) => {
    return render(
        <MemoryRouter initialEntries={[route]}>
            <AuthProvider>
                <CurrencyProvider>
                    <CartProvider>
                        {ui}
                    </CartProvider>
                </CurrencyProvider>
            </AuthProvider>
        </MemoryRouter>
    );
};

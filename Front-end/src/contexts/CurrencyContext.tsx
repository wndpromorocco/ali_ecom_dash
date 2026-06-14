import React, { createContext, useContext, useMemo } from 'react';

type Currency = 'MAD';

type CurrencyContextValue = {
  currency: Currency;
  formatPrice: (madAmount: number) => string;
  convert: (madAmount: number) => number;
};

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currency: Currency = 'MAD';

  const convert = useMemo(() => {
    return (madAmount: number) => madAmount; // No conversion needed as MAD is the base
  }, []);

  const formatPrice = useMemo(() => {
    return (madAmount: number) => {
      // Ensuring it handles both numbers and strings that might be passed in
      const amount = typeof madAmount === 'string' ? parseFloat(madAmount) : madAmount;
      if (isNaN(amount)) return '0.00 MAD';

      const fixed = amount.toFixed(2);
      return `${fixed} MAD`;
    };
  }, []);

  const value: CurrencyContextValue = { currency, formatPrice, convert };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = (): CurrencyContextValue => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider');
  return ctx;
};
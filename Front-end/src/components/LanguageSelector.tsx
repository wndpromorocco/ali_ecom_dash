import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LanguageCurrencyDialog from '@/components/LanguageCurrencyDialog';
import { useCurrency } from '@/contexts/CurrencyContext';

type LanguageSelectorProps = {
  variant?: 'light' | 'dark';
  className?: string;
};

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'light',
  className = '',
}) => {
  const { currency } = useCurrency();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2 ${variant === 'dark'
          ? 'text-white hover:text-white hover:bg-transparent'
          : 'text-[#1F2937] hover:text-[#10B981] hover:bg-[#F0FDF4]'
          } ${className}`}
      >
        <Globe className={`h-5 w-5 ${variant === 'dark' ? 'text-white' : ''}`} />
        <span className={`hidden md:inline ${variant === 'dark' ? 'text-white' : ''}`}>{currency}</span>
      </Button>
      <LanguageCurrencyDialog open={open} onOpenChange={setOpen} />
    </>
  );
};
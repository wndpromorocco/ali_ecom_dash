import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useCurrency } from '@/contexts/CurrencyContext';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const LanguageCurrencyDialog: React.FC<Props> = ({ open, onOpenChange }) => {
  const { currency } = useCurrency();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">Informations de la boutique</DialogTitle>
          <DialogDescription className="text-center">
            Notre boutique opère exclusivement en Dirham Marocain ({currency}).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4 p-4 text-center">
          <p className="text-sm text-gray-600">
            Toutes les transactions sont traitées en {currency}. C'est la devise par défaut pour tous nos clients afin de garantir les meilleurs tarifs locaux.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LanguageCurrencyDialog;

import React, { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';

export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  price: number;
  images?: string[];
  image?: string;
  category: string;
  categoryId?: string;
  modelId?: string;
  typeId?: string;
  size?: string;
  description?: string;
  descriptionAr?: string;
  color?: string; // Kept for legacy compatibility if needed
  colors?: string[];
  type?: string;
  discountPrice?: number;
  sku?: string;
  isPromo?: boolean;
  basePrice?: number;
  promoPrice?: number;
  promoEndDate?: string;
  isActive?: boolean;
  quantity?: number;
  promoStart?: string | Date;
  promoEnd?: string | Date;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  cartItemId: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, selectedSize?: string, selectedColor?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product, selectedSize?: string, selectedColor?: string) => {
    const isShoes = product.size && product.category?.toLowerCase() !== 'sac' && product.category?.toLowerCase() !== 'accessoires' && product.category?.toLowerCase() !== 'lunettes';
    const hasColors = product.colors && product.colors.length > 0;

    if (isShoes && (!selectedSize || selectedSize === 'default')) {
      toast.error('Veuillez sélectionner une pointure avant d\'ajouter au panier.');
      return;
    }

    if (hasColors && (!selectedColor || selectedColor === 'default')) {
      toast.error('Veuillez sélectionner une couleur avant d\'ajouter au panier.');
      return;
    }

    const cartItemId = `${product.id}-${selectedSize || 'default'}-${selectedColor || 'default'}`;

    setCart((prev) => {
      const existing = prev.find((item) => (item.cartItemId || item.id) === cartItemId);
      if (existing) {
        toast.success("Quantité mise à jour");
        return prev.map((item) =>
          (item.cartItemId || item.id) === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      toast.success("Ajouté au panier");
      return [...prev, { ...product, quantity: 1, selectedSize, selectedColor, cartItemId }];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => (item.cartItemId || item.id) !== cartItemId));
    toast.success("Retiré du panier");
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => ((item.cartItemId || item.id) === cartItemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

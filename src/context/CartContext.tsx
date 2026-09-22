import { createContext, useContext, useState, ReactNode } from 'react';

type CartValue = { eventId: string; selections: Record<string, number> } | null;

type CartContextShape = {
  cart: CartValue;
  setCart: (value: CartValue) => void;
};

const CartContext = createContext<CartContextShape | undefined>(undefined);

export function CartProvider({ children, initialValue = null }: { children: ReactNode; initialValue?: CartValue }) {
  const [cart, setCart] = useState<CartValue>(initialValue);
  return <CartContext.Provider value={{ cart, setCart }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}

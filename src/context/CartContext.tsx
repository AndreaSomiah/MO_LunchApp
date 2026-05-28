import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';
import type { MenuItem } from '@/types/menu';

export interface CartLine {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export interface CartContextValue {
  items: CartLine[];
  addItem: (menuItem: MenuItem, quantity: number, notes?: string) => void;
  updateQty: (menuItemId: string, quantity: number) => void;
  removeItem: (menuItemId: string) => void;
  clearCart: () => void;
  totalAmount: number;
  itemCount: number;
}

export const CartContext = createContext<CartContextValue | undefined>(undefined);

const clampQty = (n: number): number => {
  if (!Number.isFinite(n)) return 0;
  const i = Math.floor(n);
  if (i < 0) return 0;
  if (i > 10) return 10;
  return i;
};

export const CartProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [items, setItems] = useState<CartLine[]>([]);

  const addItem = useCallback((menuItem: MenuItem, quantity: number, notes?: string): void => {
    const q = clampQty(quantity);
    if (q === 0) return;
    const trimmedNotes = notes?.trim();
    setItems((prev) => {
      const idx = prev.findIndex((l) => l.menuItem.id === menuItem.id);
      if (idx === -1) {
        return [...prev, { menuItem, quantity: q, notes: trimmedNotes || undefined }];
      }
      const next = [...prev];
      const existing = next[idx]!;
      next[idx] = {
        ...existing,
        quantity: clampQty(existing.quantity + q),
        notes: trimmedNotes ?? existing.notes,
      };
      return next;
    });
  }, []);

  const updateQty = useCallback((menuItemId: string, quantity: number): void => {
    const q = clampQty(quantity);
    setItems((prev) => {
      if (q === 0) {
        return prev.filter((l) => l.menuItem.id !== menuItemId);
      }
      return prev.map((l) => (l.menuItem.id === menuItemId ? { ...l, quantity: q } : l));
    });
  }, []);

  const removeItem = useCallback((menuItemId: string): void => {
    setItems((prev) => prev.filter((l) => l.menuItem.id !== menuItemId));
  }, []);

  const clearCart = useCallback((): void => {
    setItems([]);
  }, []);

  const totalAmount = useMemo(
    () => items.reduce((sum, l) => sum + l.menuItem.price * l.quantity, 0),
    [items]
  );

  const itemCount = useMemo(() => items.reduce((sum, l) => sum + l.quantity, 0), [items]);

  const value = useMemo<CartContextValue>(
    () => ({ items, addItem, updateQty, removeItem, clearCart, totalAmount, itemCount }),
    [items, addItem, updateQty, removeItem, clearCart, totalAmount, itemCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

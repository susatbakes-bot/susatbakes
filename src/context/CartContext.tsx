'use client';

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { CartItem } from '@/types/bakery';

type CartState = {
  items: CartItem[];
  isOpen: boolean;
};

type CartAction =
  | { type: 'HYDRATE'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QTY'; payload: { id: string; quantity: number } }
  | { type: 'UPDATE_NOTE'; payload: { id: string; note: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, items: action.payload };

    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          isOpen: true,
          items: state.items.map((i) =>
            i.id === action.payload.id
              ? { ...i, quantity: i.quantity + action.payload.quantity, customNote: action.payload.customNote || i.customNote }
              : i
          ),
        };
      }
      return {
        ...state,
        isOpen: true,
        items: [...state.items, action.payload],
      };
    }

    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.id !== action.payload) };

    case 'UPDATE_QTY':
      return {
        ...state,
        items: state.items
          .map((i) =>
            i.id === action.payload.id ? { ...i, quantity: Math.max(0, action.payload.quantity) } : i
          )
          .filter((i) => i.quantity > 0),
      };

    case 'UPDATE_NOTE':
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload.id ? { ...i, customNote: action.payload.note } : i
        ),
      };

    case 'CLEAR_CART':
      return { ...state, items: [] };

    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };

    case 'OPEN_CART':
      return { ...state, isOpen: true };

    case 'CLOSE_CART':
      return { ...state, isOpen: false };

    default:
      return state;
  }
}

type CartContextValue = {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  total: number;
  itemCount: number;
  hydrated: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('susatbakes_cart_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          dispatch({ type: 'HYDRATE', payload: parsed });
        }
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem('susatbakes_cart_v2', JSON.stringify(state.items));
      } catch (e) {
        console.error('Failed to save cart to localStorage', e);
      }
    }
  }, [state.items, hydrated]);

  const total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  const addItem = (item: CartItem) => dispatch({ type: 'ADD_ITEM', payload: item });
  const removeItem = (id: string) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const updateQty = (id: string, quantity: number) => dispatch({ type: 'UPDATE_QTY', payload: { id, quantity } });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });
  const toggleCart = () => dispatch({ type: 'TOGGLE_CART' });
  const openCart = () => dispatch({ type: 'OPEN_CART' });
  const closeCart = () => dispatch({ type: 'CLOSE_CART' });

  return (
    <CartContext.Provider
      value={{
        state,
        dispatch,
        total,
        itemCount,
        hydrated,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

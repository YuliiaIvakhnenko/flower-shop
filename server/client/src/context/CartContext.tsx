import React, { createContext, useContext, useMemo, useState } from "react";
import { CartItem } from "../interfaces/types";

type CartCtx = {
  items: CartItem[];
  total: number;
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  inc: (id: string, type: CartItem["productType"]) => void;
  dec: (id: string, type: CartItem["productType"]) => void;
  remove: (id: string, type: CartItem["productType"]) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);

export const useCart = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("CartContext missing");
  return v;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const total = useMemo(
    () => items.reduce((s, i) => s + i.price * i.quantity, 0),
    [items]
  );

  const add: CartCtx["add"] = (item, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex(
        (p) => p.productId === item.productId && p.productType === item.productType
      );
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + qty };
        return copy;
      }
      return [...prev, { ...item, quantity: qty }];
    });
  };

  const inc: CartCtx["inc"] = (id, type) =>
    setItems((prev) =>
      prev.map((p) =>
        p.productId === id && p.productType === type
          ? { ...p, quantity: p.quantity + 1 }
          : p
      )
    );

  const dec: CartCtx["dec"] = (id, type) =>
    setItems((prev) =>
      prev.map((p) =>
        p.productId === id && p.productType === type
          ? { ...p, quantity: Math.max(1, p.quantity - 1) }
          : p
      )
    );

  const remove: CartCtx["remove"] = (id, type) =>
    setItems((prev) =>
      prev.filter((p) => !(p.productId === id && p.productType === type))
    );

  const clear: CartCtx["clear"] = () => setItems([]);

  return (
    <Ctx.Provider value={{ items, total, add, inc, dec, remove, clear }}>
      {children}
    </Ctx.Provider>
  );
};

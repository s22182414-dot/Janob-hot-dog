import { useCallback, useEffect, useState } from "react";
import { menu, type MenuItem } from "@/data/menu";

const MENU_KEY = "janob_menu";

/** localStorage'dan menyuni o'qiydi; bo'lmasa statik menyu */
export function loadMenuItems(): MenuItem[] {
  try {
    const raw = localStorage.getItem(MENU_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) return parsed as MenuItem[];
    }
  } catch {
    /* ignore */
  }
  return menu;
}

export function saveMenuItems(items: MenuItem[]) {
  try {
    localStorage.setItem(MENU_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

function makeId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    /* ignore */
  }
  return `item-${Date.now()}`;
}

/**
 * Menyu holati — localStorage'da saqlanadi, shuning uchun admin qo'shgan/o'chirgan
 * o'zgarishlar sayt yangilanganda ham esda qoladi.
 * SSR xavfsiz: boshlang'ich holat statik menyu, keyin useEffect'da localStorage yuklanadi.
 */
export function useMenu() {
  const [items, setItems] = useState<MenuItem[]>(menu);

  useEffect(() => {
    setItems(loadMenuItems());
  }, []);

  const addItem = useCallback((data: Omit<MenuItem, "id">) => {
    const id = makeId();
    setItems((prev) => {
      const next = [...prev, { ...data, id }];
      saveMenuItems(next);
      return next;
    });
    return id;
  }, []);

  const updateItem = useCallback((id: string, data: Omit<MenuItem, "id">) => {
    setItems((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...data, id } : m));
      saveMenuItems(next);
      return next;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((m) => m.id !== id);
      saveMenuItems(next);
      return next;
    });
  }, []);

  return { items, addItem, updateItem, removeItem };
}

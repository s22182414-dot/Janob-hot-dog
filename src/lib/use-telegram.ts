import { useCallback, useEffect, useState } from "react";

export type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

const STORAGE_KEY = "janob_telegram";

export function useTelegram() {
  const [tg, setTg] = useState<TelegramUser | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTg(JSON.parse(raw) as TelegramUser);
    } catch { /* ignore */ }
  }, []);

  const connect = useCallback((user: TelegramUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    setTg(user);
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setTg(null);
  }, []);

  return { tg, connect, disconnect };
}
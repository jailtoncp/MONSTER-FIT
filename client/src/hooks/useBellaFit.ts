import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteAccount, getCurrentAccount, loadData, loginAccount, registerAccount, resetLocalPassword, saveData, signOut } from "../lib/storageService";
import type { Account, BellaData } from "../types";

export function useBellaFit() {
  const [account, setAccount] = useState<Account | null>(() => getCurrentAccount());
  const [data, setData] = useState<BellaData | null>(() => {
    const current = getCurrentAccount();
    return current ? loadData(current) : null;
  });
  const [storageError, setStorageError] = useState("");

  useEffect(() => {
    if (!account || !data) return;
    try { saveData(account, data); setStorageError(""); }
    catch { setStorageError("O armazenamento deste dispositivo está cheio ou indisponível. Exporte um backup antes de continuar."); }
  }, [account, data]);

  const updateData = useCallback((updater: (current: BellaData) => BellaData) => {
    setData((current) => current ? updater(current) : current);
  }, []);

  const auth = useMemo(() => ({
    async login(email: string, password: string) {
      const next = await loginAccount(email, password);
      setAccount(next); setData(loadData(next));
    },
    async register(name: string, email: string, password: string) {
      const next = await registerAccount(name, email, password);
      setAccount(next); setData(loadData(next));
    },
    async resetPassword(email: string, password: string) { await resetLocalPassword(email, password); },
    logout() { signOut(); setAccount(null); setData(null); },
    deleteAccount() { if (account) deleteAccount(account); setAccount(null); setData(null); },
  }), [account]);

  return { account, data, updateData, auth, storageError };
}

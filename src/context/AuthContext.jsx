import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { USE_MOCK } from '../api/client';
import { createOrder, getRecords } from '../api/account';
import { recordStore } from '../api/localRecords';
import { supabase } from '../lib/supabase';
import { RECORDS_EVENT, RECORDS_KEY } from '../api/mock/recordStore';
import { readStorage, writeStorage } from '../hooks/useLocalStorage';
import { createDemoAccount, matchesPassword, normalizeEmail, publicProfile, registeredAccounts, validateRegistration } from './demoAccounts';

export const demoUsers = [
  { id: 'student', name: 'Демо суралцагч', email: 'user@magiccode.mn', password: 'User123!', role: 'user' },
];
const AuthContext = createContext(null);
function read(key, fallback) {
  try { return JSON.parse(readStorage(key, JSON.stringify(fallback))); } catch { return fallback; }
}
function DemoAuthProvider({ children }) {
  const [registered, setRegistered] = useState(() => registeredAccounts(read('mc-demo-accounts-v1', [])));
  const accounts = [...demoUsers, ...registered];
  const [user, setUser] = useState(() => {
    const id = readStorage('mc-demo-session', '');
    const account = accounts.find((u) => u.id === id);
    if (!account) return null;
    return publicProfile(account);
  });
  const [allRecords, setRecords] = useState(() => { try { return recordStore.list(); } catch { return []; } });
  useEffect(() => {
    const refresh = () => { try { setRecords(recordStore.list()); } catch { /* Preserve the visible copy if saved data is damaged. */ } };
    const onStorage = (event) => { if (event.key === RECORDS_KEY) refresh(); };
    window.addEventListener(RECORDS_EVENT, refresh);
    window.addEventListener('storage', onStorage);
    return () => { window.removeEventListener(RECORDS_EVENT, refresh); window.removeEventListener('storage', onStorage); };
  }, []);
  async function login(email, password) {
    const account = accounts.find((u) => u.email === normalizeEmail(email));
    if (!account || !(account.password ? account.password === password : await matchesPassword(account, password))) return false;
    const profile = publicProfile(account);
    writeStorage('mc-demo-session', account.id);
    setUser(profile);
    return profile;
  }
  async function register(details) {
    const saved = registeredAccounts(read('mc-demo-accounts-v1', []));
    const error = validateRegistration(details, [...demoUsers, ...saved]);
    if (error) return { error };
    const account = await createDemoAccount(details);
    // Re-read after hashing so concurrent submissions cannot overwrite accounts.
    const latest = registeredAccounts(read('mc-demo-accounts-v1', []));
    if (validateRegistration(details, [...demoUsers, ...latest])) return { error: 'duplicate' };
    const next = [...latest, account];
    if (!writeStorage('mc-demo-accounts-v1', JSON.stringify(next))) return { error: 'storage' };
    setRegistered(next);
    const profile = publicProfile(account);
    writeStorage('mc-demo-session', account.id);
    setUser(profile);
    return { profile };
  }
  function logout() { writeStorage('mc-demo-session', ''); setUser(null); }
  function addRecord(type, items) {
    if (!user || !items.length) return;
    recordStore.add({ type, items, userId: user.id, name: user.name, email: user.email });
  }
  return <AuthContext.Provider value={{ user, ready: true, remote: false, login, register, logout, records: allRecords.filter((record) => !record.deletedAt), addRecord, refreshRecords: () => {} }}>{children}</AuthContext.Provider>;
}

const toUser = (account) => account ? {
  id: account.id,
  email: account.email,
  name: account.user_metadata?.name || account.email,
  role: account.app_metadata?.role === 'admin' ? 'admin' : 'user',
} : null;

// Supabase Auth: нууц үг сервер дээр хадгалагдаж, session-ийг supabase-js удирдана.
function SupabaseAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [records, setRecords] = useState([]);
  const userId = user?.id;

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(
      ({ data }) => { if (active) { setUser(toUser(data.session?.user)); setReady(true); } },
      () => { if (active) setReady(true); },
    );
    const { data } = supabase.auth.onAuthStateChange((_event, session) => { setUser(toUser(session?.user)); setReady(true); });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);

  const refreshRecords = useCallback(async () => {
    if (!userId) { setRecords([]); return; }
    setRecords(await getRecords());
  }, [userId]);
  useEffect(() => { refreshRecords().catch(() => {}); }, [refreshRecords]);

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email: normalizeEmail(email), password });
    if (!error) return toUser(data.user);
    if (error.code === 'email_not_confirmed') return { error: 'unconfirmed' };
    if (error.code === 'invalid_credentials') return false;
    if (error.status === 429) return { error: 'rate' };
    throw error;
  }
  async function register(details) {
    const invalid = validateRegistration(details, []);
    if (invalid) return { error: invalid };
    const { data, error } = await supabase.auth.signUp({
      email: normalizeEmail(details.email),
      password: details.password,
      options: { data: { name: details.name.trim() }, emailRedirectTo: `${window.location.origin}/login` },
    });
    if (error) {
      if (error.code === 'user_already_exists') return { error: 'duplicate' };
      if (error.code === 'weak_password') return { error: 'password' };
      if (error.status === 429) return { error: 'rate' };
      throw error;
    }
    // Бүртгэлтэй и-мэйлийг Supabase алдаагүй буцаадаг; identities хоосон байвал давхардсан.
    if (data.user?.identities?.length === 0) return { error: 'duplicate' };
    return data.session ? { profile: toUser(data.user) } : { confirm: true };
  }
  async function logout() {
    await supabase.auth.signOut({ scope: 'local' });
  }
  async function addRecord(type, items) {
    if (!userId || !items.length || type !== 'order') return;
    const record = await createOrder(items);
    setRecords((previous) => [record, ...previous]);
  }
  return <AuthContext.Provider value={{ user, ready, remote: true, login, register, logout, records: records.filter((record) => !record.deletedAt), addRecord, refreshRecords }}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }) {
  const Provider = !USE_MOCK && supabase ? SupabaseAuthProvider : DemoAuthProvider;
  return <Provider>{children}</Provider>;
}
export const useAuth = () => useContext(AuthContext);

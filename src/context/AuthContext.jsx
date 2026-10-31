import { createContext, useContext, useEffect, useState } from 'react';
import { recordStore } from '../api/localRecords';
import { RECORDS_EVENT, RECORDS_KEY } from '../api/mock/recordStore';
import { readStorage, writeStorage } from '../hooks/useLocalStorage';
import { createDemoAccount, matchesPassword, normalizeEmail, publicProfile, registeredAccounts, validateRegistration } from './demoAccounts';

export const demoUsers = [
  { id: 'admin', name: 'Админ', email: 'admin@magiccode.mn', password: 'Admin123!', role: 'admin' },
  { id: 'student', name: 'Демо суралцагч', email: 'user@magiccode.mn', password: 'User123!', role: 'user' },
];
const AuthContext = createContext(null);
function read(key, fallback) {
  try { return JSON.parse(readStorage(key, JSON.stringify(fallback))); } catch { return fallback; }
}
export function AuthProvider({ children }) {
  const [registered, setRegistered] = useState(() => registeredAccounts(read('mc-demo-accounts-v1', [])));
  const accounts = [...demoUsers, ...registered];
  const [, setProfileRevision] = useState(0);
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
  function updateStatus(id, status) {
    if (user?.role !== 'admin') throw Object.assign(new Error('forbidden'), { code: 'forbidden' });
    return recordStore.update(id, status);
  }
  function updateAccountProfile(id, details) {
    if (user?.role !== 'admin') throw Object.assign(new Error('forbidden'), { code: 'forbidden' });
    if (!accounts.some((account) => account.id === id) || !details.name?.trim()) throw Object.assign(new Error('validation'), { code: 'validation_error' });
    const profile = { name: details.name.trim().slice(0, 100), phone: (details.phone || '').trim().slice(0, 100), goal: (details.goal || '').trim().slice(0, 300) };
    if (!writeStorage(`mc-profile-${id}`, JSON.stringify(profile))) throw Object.assign(new Error('storage'), { code: 'storage_error' });
    setProfileRevision((revision) => revision + 1);
  }
  const accountProfiles = accounts.map((account) => {
    const profile = read(`mc-profile-${account.id}`, {});
    return { ...publicProfile(account), name: profile?.name || account.name, phone: profile?.phone || '', goal: profile?.goal || '' };
  });
  function changeRecord(id, action) {
    if (user?.role !== 'admin' || !['delete', 'restore'].includes(action)) throw Object.assign(new Error('forbidden'), { code: 'forbidden' });
    return recordStore.update(id, action);
  }
  return <AuthContext.Provider value={{ user, accounts: accountProfiles, login, register, logout, records: allRecords.filter((record) => !record.deletedAt), allRecords, addRecord, updateStatus, changeRecord, updateAccountProfile }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);

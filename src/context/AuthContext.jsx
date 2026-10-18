import { createContext, useContext, useState } from 'react';
import { readStorage, writeStorage } from '../hooks/useLocalStorage';

export const demoUsers = [
  { id: 'admin', name: 'Админ', email: 'admin@magiccode.mn', password: 'Admin123!', role: 'admin' },
  { id: 'student', name: 'Демо суралцагч', email: 'user@magiccode.mn', password: 'User123!', role: 'user' },
];
const AuthContext = createContext(null);
function read(key, fallback) {
  try { return JSON.parse(readStorage(key, JSON.stringify(fallback))); } catch { return fallback; }
}
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const id = readStorage('mc-demo-session', '');
    const account = demoUsers.find((u) => u.id === id);
    if (!account) return null;
    const { password, ...profile } = account;
    return profile;
  });
  const [records, setRecords] = useState(() => {
    const saved = read('mc-demo-records', []);
    return Array.isArray(saved) ? saved.filter((r) => r && typeof r.id === 'string' && Array.isArray(r.items)) : [];
  });
  function login(email, password) {
    const account = demoUsers.find((u) => u.email === email.trim().toLowerCase() && u.password === password);
    if (!account) return false;
    const { password: secret, ...profile } = account;
    writeStorage('mc-demo-session', account.id);
    setUser(profile);
    return profile;
  }
  function logout() { writeStorage('mc-demo-session', ''); setUser(null); }
  function addRecord(type, items) {
    if (!user || !items.length) return;
    setRecords((previous) => {
      const next = [{ id: crypto.randomUUID(), userId: user.id, type, items, status: 'new', createdAt: new Date().toISOString() }, ...previous];
      writeStorage('mc-demo-records', JSON.stringify(next));
      return next;
    });
  }
  function updateStatus(id, status) {
    if (user?.role !== 'admin' || !['new', 'done'].includes(status)) return;
    setRecords((previous) => {
      const next = previous.map((r) => r.id === id ? { ...r, status } : r);
      writeStorage('mc-demo-records', JSON.stringify(next));
      return next;
    });
  }
  return <AuthContext.Provider value={{ user, login, logout, records, addRecord, updateStatus }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);

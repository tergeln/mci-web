import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { getMyCourses, getMyOrders } from '../api/commerce';
import { learningCourses } from '../data/lessons';
import { readStorage, writeStorage } from '../hooks/useLocalStorage';
import { entitlementExpiry } from '../data/courseAccess';
import { activeCourseIds } from '../api/mock/courseOrders';

const CommerceContext = createContext(null);
const KEY = 'mc-course-cart-v1';
const validIds = new Set(learningCourses.map((course) => course.id));
function savedCart() {
  try { const items = JSON.parse(readStorage(KEY, '[]')); return Array.isArray(items) ? [...new Set(items.filter((id) => validIds.has(id)))] : []; } catch { return []; }
}
export function CommerceProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(savedCart);
  const [library, setLibrary] = useState({ userId: null, courses: [], orders: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [classroomRequest, setClassroomRequest] = useState(null);
  const generation = useRef(0);
  const userId = user?.id;
  const refresh = useCallback(async () => {
    const version = ++generation.current;
    if (!userId) { setLibrary({ userId: null, courses: [], orders: [] }); setLoading(false); setError(null); return; }
    setLoading(true); setError(null);
    try {
      const [courses, orders] = await Promise.all([getMyCourses(userId), getMyOrders(userId)]);
      if (version === generation.current) setLibrary({ userId, courses, orders });
    } catch (cause) {
      if (version === generation.current) { setLibrary({ userId, courses: [], orders: [] }); setError(cause); }
    } finally { if (version === generation.current) setLoading(false); }
  }, [userId]);
  useEffect(() => { refresh(); return () => { generation.current++; }; }, [refresh]);
  useEffect(() => {
    if (!userId) return;
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [userId, refresh]);
  const openCourse = useCallback((courseId) => setClassroomRequest((previous) => ({ courseId, id: (previous?.id || 0) + 1 })), []);
  const entitlements = library.userId === userId ? library.courses : [];
  const ownedIds = activeCourseIds(user, entitlements);
  const owned = new Set(ownedIds);
  const [expiryTick, tickExpiry] = useState(0);
  useEffect(() => {
    const next = Math.min(...entitlements.map((item) => Date.parse(entitlementExpiry(item))).filter((date) => date > Date.now()));
    if (!Number.isFinite(next)) return;
    const timer = window.setTimeout(() => tickExpiry((value) => value + 1), Math.min(next - Date.now() + 10, 2147483647));
    return () => window.clearTimeout(timer);
  }, [entitlements, expiryTick]);
  const updateCart = (next) => {
    if (!writeStorage(KEY, JSON.stringify(next))) throw new Error('storage_error');
    setCart(next);
  };
  const addCourse = (id) => { if (validIds.has(id) && !owned.has(id)) updateCart([...new Set([...cart, id])]); };
  const removeCourse = (id) => updateCart(cart.filter((item) => item !== id));
  useEffect(() => {
    const onStorage = (event) => { if (event.key === KEY) setCart(savedCart()); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  return <CommerceContext.Provider value={{ cart: cart.filter((id) => !owned.has(id)), addCourse, removeCourse,
    entitlements, ownedIds, hasAccess: (id) => owned.has(id), orders: library.userId === userId ? library.orders : [],
    loading, error, refresh, classroomRequest,
    openCourse,
  }}>{children}</CommerceContext.Provider>;
}
export const useCommerce = () => useContext(CommerceContext);

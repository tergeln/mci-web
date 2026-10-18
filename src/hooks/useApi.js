import { useEffect, useState } from 'react';

/**
 * Өгөгдөл татаж loading / error / data төлөвийг өгнө.
 *   const { data, loading, error, reload } = useApi((signal) => getCourses({ signal }), []);
 * deps өөрчлөгдөхөд дахин татаж, өмнөх хүсэлтийг цуцална.
 */
export default function useApi(fetcher, deps) {
  const [state, setState] = useState({ data: undefined, error: null, loading: true });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ data: s.data, error: null, loading: true }));
    fetcher(controller.signal).then(
      (data) => setState({ data, error: null, loading: false }),
      (error) => {
        if (error.name !== 'AbortError') setState({ data: undefined, error, loading: false });
      },
    );
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  return { ...state, reload: () => setAttempt((n) => n + 1) };
}

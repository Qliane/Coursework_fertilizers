import { useState, useCallback, useRef, useEffect } from 'react';

export const useApiRequest = (apiFunction, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunction(...args);
      if (isMounted.current) {
        setData(result);
        if (options.onSuccess) options.onSuccess(result);
      }
      return result;
    } catch (err) {
      if (isMounted.current) {
        const message = err.response?.data?.error || err.message || 'Ошибка запроса';
        setError(message);
        if (options.onError) options.onError(err);
      }
      throw err;
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [apiFunction, options]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
};
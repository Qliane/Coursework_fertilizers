import { useState, useEffect, useCallback } from 'react';
import { authService } from '@/api/endpoints/auth';
import { AuthContext } from '@/modules/auth/context/AuthContext';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const result = await authService.getCurrentUser();
      if (result) setUser(result);
      else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const login = async (username, password) => {
    setError(null);
    try {
      const result = await authService.login(username, password);
      if (result.token && result.user) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        setUser(result.user);
        return { success: true, user: result.user };
      }
      throw new Error('Некорректный ответ от сервера');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Ошибка авторизации';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{
      user, loading, error, login, logout,
      isAuthenticated: !!user, clearError, refreshUser: checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};
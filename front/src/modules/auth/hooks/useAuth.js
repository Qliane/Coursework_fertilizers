import { useContext } from 'react';
import { AuthContext } from '@/modules/auth/context/AuthContext';

export const useAuth = () => useContext(AuthContext);
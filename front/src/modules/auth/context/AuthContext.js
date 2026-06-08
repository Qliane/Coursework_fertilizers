import { createContext } from 'react';

// Создаём и экспортируем контекст, чтобы его могли использовать AuthProvider
export const AuthContext = createContext({});

// Реэкспорт провайдера из отдельного файла
import { AuthProvider } from '@/app/store/AuthProvider'
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
// src/contexts/GlobalSelectionContext.jsx
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { storageService } from '@/api/endpoints/storage';
import { partnerService } from '@/api/endpoints/partner';
import { useAuth } from '@/modules/auth/hooks/useAuth';

const GlobalSelectionContext = createContext();

export const useGlobalSelection = () => useContext(GlobalSelectionContext);

export const GlobalSelectionProvider = ({ children }) => {
  const { user } = useAuth();
  const [storages, setStorages] = useState([]);
  const [partners, setPartners] = useState([]);
  const [selectedStorageId, setSelectedStorageId] = useState(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState(null);
  const [mode, setMode] = useState('storage');
  const isInitialized = useRef(false);

  const loadStorages = useCallback(async () => {
    if (!user) return;
    try {
      const data = await storageService.getAll();
      setStorages(data);
      if (user.roleId === 1 && user.storageid) {
        setSelectedStorageId(user.storageid);
      } else if (data.length > 0 && !selectedStorageId) {
        const saved = localStorage.getItem('selectedStorageId');
        if (saved) setSelectedStorageId(Number(saved));
        else setSelectedStorageId(data[0].id);
      }
    } catch (err) {
      console.error('Ошибка загрузки складов:', err);
    }
  }, [user, selectedStorageId]);

  const loadPartners = useCallback(async () => {
    if (!user) return;
    try {
      const data = await partnerService.getAll();
      setPartners(data);
      if (data.length > 0 && !selectedPartnerId) {
        const saved = localStorage.getItem('selectedPartnerId');
        if (saved) setSelectedPartnerId(Number(saved));
        else setSelectedPartnerId(data[0].id);
      }
    } catch (err) {
      console.error('Ошибка загрузки партнёров:', err);
    }
  }, [user, selectedPartnerId]);

  useEffect(() => {
    if (!isInitialized.current && user) {
      isInitialized.current = true;
      loadStorages();
      loadPartners();
    }
  }, [user, loadStorages, loadPartners]);

  useEffect(() => {
    if (selectedStorageId) localStorage.setItem('selectedStorageId', selectedStorageId);
  }, [selectedStorageId]);

  useEffect(() => {
    if (selectedPartnerId) localStorage.setItem('selectedPartnerId', selectedPartnerId);
  }, [selectedPartnerId]);

  const value = {
    storages,
    partners,
    selectedStorageId,
    selectedPartnerId,
    setSelectedStorageId,
    setSelectedPartnerId,
    mode,
    setMode,
  };

  return (
    <GlobalSelectionContext.Provider value={value}>
      {children}
    </GlobalSelectionContext.Provider>
  );
};
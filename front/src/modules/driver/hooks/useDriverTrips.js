import { useState, useEffect, useCallback } from 'react';
import { updService } from '@/api/endpoints/upd';
import { DRIVER_EB_STATUS_FILTERS } from '@/utils/constants';

export const useDriverTrips = () => {
  const [driver, setDriver] = useState(null);
  const [upds, setUpds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [ebStatus, setEbStatus] = useState(DRIVER_EB_STATUS_FILTERS.PENDING);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (ebStatus && ebStatus !== DRIVER_EB_STATUS_FILTERS.ALL) {
        params.ebStatus = ebStatus;
      }
      if (dateFrom) params.dateFrom = dateFrom.toISOString().split('T')[0];
      if (dateTo) params.dateTo = dateTo.toISOString().split('T')[0];
      
      const data = await updService.getDriverUpds(params);
      setDriver(data.driver);
      setUpds(data.upds || []);
    } catch (err) {
      const message = err.response?.data?.error || 'Ошибка загрузки перевозок';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [ebStatus, dateFrom, dateTo]);

  const resetFilters = () => {
    setEbStatus(DRIVER_EB_STATUS_FILTERS.ALL);
    setDateFrom(null);
    setDateTo(null);
  };

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  return {
    driver,
    upds,
    loading,
    error,
    ebStatus,
    dateFrom,
    dateTo,
    setEbStatus,
    setDateFrom,
    setDateTo,
    resetFilters,
    refetch: fetchTrips,
  };
};
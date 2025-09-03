// src/hooks/useApiData.js
import { useState, useEffect, useCallback } from 'react';
import WhoDataService from '../services/whoDataService';

// Generic API hook
export const useApiData = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err);
      console.error('API call failed:', err);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// Specific hooks for Uganda health data
export const useUgandaHealth = () => {
  return useApiData(() => WhoDataService.getUgandaHealthData());
};

export const useHealthSummary = () => {
  return useApiData(() => WhoDataService.getHealthSummary());
};

export const useTrendData = () => {
  return useApiData(() => WhoDataService.getTrendData());
};

export const useHealthIndicators = (indicator = null) => {
  return useApiData(
    () => WhoDataService.getHealthIndicators(indicator),
    [indicator]
  );
};

export const useRegionalData = () => {
  return useApiData(() => WhoDataService.getRegionalData());
};

export default useApiData;
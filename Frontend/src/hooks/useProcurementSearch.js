// src/hooks/useProcurementSearch.js
import { useState, useCallback, useRef } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { fetchProcurements, mapApiProcurementToFrontend } from '../services/api';

export const useProcurementSearch = () => {
  const { settings, buildRequestBody, updateTotalResults } = useSettings();
  
  const [procurements, setProcurements] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  const lastSearchParamsRef = useRef(null);

  const executeSearch = useCallback(async (searchParams) => {
    setIsLoading(true);
    setError(null);
    if (!hasSearched) setHasSearched(true);
    
    if (searchParams.criteria) {
      lastSearchParamsRef.current = searchParams;
    }
    
    const currentSearch = lastSearchParamsRef.current || {};
    const requestBody = buildRequestBody({ ...currentSearch, ...searchParams }, settings);

    try {
      const apiResponse = await fetchProcurements(requestBody);
      const newProcurements = (apiResponse.data || []).map(mapApiProcurementToFrontend);
      
      setProcurements(newProcurements);
      setPagination({ page: apiResponse.page, total_pages: apiResponse.total_pages });
      updateTotalResults(apiResponse.total_items);

      if (apiResponse.total_items === 0) {
        setError("Keine Ausschreibungen für Ihre Suche gefunden.");
      }
    } catch (err) {
      setError("Fehler beim Laden der Ausschreibungen. Bitte versuchen Sie es erneut.");
      setProcurements([]);
    } finally {
      setIsLoading(false);
    }
  }, [settings, buildRequestBody, updateTotalResults, hasSearched]);

  // Added function to reset the search state
  const resetSearch = () => {
    setProcurements([]);
    setPagination({ page: 1, total_pages: 0 });
    setError(null);
    setHasSearched(false);
    updateTotalResults(0);
    lastSearchParamsRef.current = null;
  };

  return {
    procurements,
    pagination,
    isLoading,
    error,
    hasSearched,
    executeSearch,
    resetSearch, // Export new function
  };
};
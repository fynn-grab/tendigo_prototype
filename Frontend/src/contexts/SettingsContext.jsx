// src/contexts/SettingsContext.jsx
import React, { createContext, useState, useContext } from 'react';
import { useProcumaCookies } from '../hooks/useCookies';

const SettingsContext = createContext();
export const useSettings = () => useContext(SettingsContext);

export const DEFAULT_SETTINGS = {
  // Unused keys removed
};

const buildRequestBody = (searchParams, globalSettings = {}) => {
  const { 
    criteria, 
    page = 1, 
    pageSize = 20, // Add a default page size
    publicationDate = null,
    submissionStartDate = null,
    submissionEndDate = null
  } = searchParams;
  
  const requestBody = {
    page: page,
    page_size: pageSize, // Pass page size to the API
    search_criteria: [],
    filters: {}
  };

  if (criteria && criteria.length > 0) {
    requestBody.search_criteria = criteria
      .filter(c => c.term.trim() !== '')
      .map(({ id, ...rest }) => rest);
  }
  
  // Timezone-safe helper to format a Date object to a 'YYYY-MM-DD' string.
  const formatDate = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  if (publicationDate) {
    requestBody.filters.publication_date_after = formatDate(publicationDate);
  }
  if (submissionStartDate) {
    requestBody.filters.submission_start_date = formatDate(submissionStartDate);
  }
  if (submissionEndDate) {
    requestBody.filters.submission_end_date = formatDate(submissionEndDate);
  }
  
  // Fallback search for empty queries to get initial results.
  if (requestBody.search_criteria.length === 0 && Object.keys(requestBody.filters).length === 0) {
      requestBody.search_criteria.push({ term: 'a', operator: null, negate: false, scope: 'both' });
  }

  return requestBody;
};

export const SettingsProvider = ({ children }) => {
  const { getCookie, setCookie } = useProcumaCookies();
  
  const [settings, setSettings] = useState(() => {
    const savedSettings = getCookie('user_settings');
    return savedSettings ? { ...DEFAULT_SETTINGS, ...savedSettings } : DEFAULT_SETTINGS;
  });
  
  const [totalResults, setTotalResults] = useState(0);

  const updateSettings = (newSettings) => {
    setSettings(newSettings);
    setCookie('user_settings', newSettings);
  };
  
  const updateTotalResults = (count) => setTotalResults(count);

  const contextValue = { 
    settings,
    updateSettings,
    DEFAULT_SETTINGS,
    totalResults, 
    updateTotalResults,
    buildRequestBody,
  };

  return <SettingsContext.Provider value={contextValue}>{children}</SettingsContext.Provider>;
};
// src/hooks/useXmlDetailModal.js
import { useState } from 'react';
import { fetchDocumentDetails } from '../services/api';

export const useXmlDetailModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [llmSummaryHtml, setLlmSummaryHtml] = useState(null);
  const [fullTreeData, setFullTreeData] = useState(null);
  
  const [isFullViewVisible, setIsFullViewVisible] = useState(false);

  const showDetails = async (procurement) => {
    setIsModalOpen(true);
    setIsLoading(true);
    setError(null);
    setLlmSummaryHtml(null);
    setFullTreeData(null);
    setIsFullViewVisible(false);

    const originalPath = procurement?._raw?.source_file_path;
    if (!originalPath) {
      setError("Der Pfad zur Quelldatei ist für dieses Element nicht verfügbar.");
      setIsLoading(false);
      return;
    }

    try {
      const normalizedPath = originalPath.replace(/\\/g, '/');
      const marker = 'bekanntmachungsservice_eforms/';
      const markerIndex = normalizedPath.indexOf(marker);

      let cleanPath = originalPath;
      if (markerIndex !== -1) {
        cleanPath = normalizedPath.substring(markerIndex + marker.length);
      } else {
        console.error("Could not find the expected base folder 'bekanntmachungsservice_eforms/' in path:", originalPath);
      }
      
      const details = await fetchDocumentDetails(cleanPath);
      
      setLlmSummaryHtml(details.llmSummaryHtml);
      setFullTreeData(details.fullTreeData);

    } catch (err) {
      setError("Dokumentdetails konnten nicht vom Server geladen werden.");
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const toggleFullView = () => {
    setIsFullViewVisible(prev => !prev);
  }

  return {
    isModalOpen,
    isLoading,
    error,
    llmSummaryHtml,
    fullTreeData,
    isFullViewVisible,
    showDetails,
    closeModal,
    toggleFullView,
  };
};
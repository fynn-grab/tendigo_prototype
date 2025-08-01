// src/pages/MatchingPage.jsx
import React, { useState, useEffect } from 'react';
import "react-datepicker/dist/react-datepicker.css";
import ChatbotPanel from '../components/common/ChatbotPanel.jsx';
import ProcurementListItem from '../components/common/ProcurementListItem.jsx';
import InitialSearchPlaceholder from '../components/common/InitialSearchPlaceholder.jsx';
import XmlDetailModal from '../components/common/XmlDetailModal.jsx';
import LoadingAnimation from '../components/common/LoadingAnimation.jsx';
import SearchForm from '../components/search/SearchForm.jsx';
import { useProcurementSearch } from '../hooks/useProcurementSearch.js';
import { useXmlDetailModal } from '../hooks/useXmlDetailModal.js';
import { useSettings } from '../contexts/SettingsContext';
import { likeProcurement, unlikeProcurement, getLikedProcurements, saveSearch, getSavedSearches } from '../services/api';
import styles from './MatchingPage.module.css';
import commonStyles from '../components/common/Common.module.css';
import { SearchX } from 'lucide-react';

const MatchingPage = () => {
  const { totalResults } = useSettings();
  const { procurements, pagination, isLoading, error, hasSearched, executeSearch, resetSearch } = useProcurementSearch();
  const { isModalOpen, isLoading: isDetailLoading, error: detailError, llmSummaryHtml, fullTreeData, isFullViewVisible, toggleFullView, showDetails, closeModal } = useXmlDetailModal();

  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);
  const [chatProcurementContext, setChatProcurementContext] = useState({ id: null, title: null });
  const [likedIds, setLikedIds] = useState(new Set());
  const [savedSearches, setSavedSearches] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [likedItems, searches] = await Promise.all([
          getLikedProcurements(),
          getSavedSearches()
        ]);
        setLikedIds(new Set(likedItems.map(item => item.id)));
        setSavedSearches(searches);
      } catch (error) {
        console.error("Failed to fetch initial page data:", error);
      }
    };
    fetchInitialData();
  }, []);
  
  const handleSearch = (searchParams) => {
    executeSearch({ ...searchParams, page: 1 });
  };

  const handleReset = () => {
    resetSearch();
  };
  
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.total_pages && !isLoading) {
      executeSearch({ page: newPage });
      window.scrollTo(0, 0);
    }
  };

  const handleSaveSearch = async (searchParams) => {
    const hasCriteria = searchParams.criteria.some(c => c.term.trim() !== '');
    if (!hasCriteria) {
      alert("Bitte geben Sie mindestens einen Suchbegriff ein, um die Suche zu speichern.");
      return;
    }

    const name = prompt("Wie möchten Sie dieses Suchprofil nennen?");
    if (name && name.trim() !== '') {
      const newSearch = {
        id: Date.now(),
        name: name.trim(),
        params: searchParams,
        interval: 'daily'
      };
      await saveSearch(newSearch);
      const updatedSearches = await getSavedSearches();
      setSavedSearches(updatedSearches);
      alert(`Suchprofil "${name.trim()}" wurde gespeichert. Sie können es in den Einstellungen verwalten.`);
    }
  };

  const toggleChatForProcurement = (procurement) => {
    setChatProcurementContext({ id: procurement.id, title: procurement.title });
    setIsChatPanelOpen(true);
  };

  const handleLikeToggle = async (procurement) => {
    const newLikedIds = new Set(likedIds);
    if (likedIds.has(procurement.id)) {
      await unlikeProcurement(procurement.id);
      newLikedIds.delete(procurement.id);
    } else {
      await likeProcurement(procurement);
      newLikedIds.add(procurement.id);
    }
    setLikedIds(newLikedIds);
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingAnimation />;
    }
    if (!hasSearched) {
      return (
        <div className={styles.procurementList}>
          <InitialSearchPlaceholder />
        </div>
      );
    }
    if (error) {
      return (
        <div className={styles.pageStateMessage}>
          <SearchX size={48} />
          <p>{error}</p>
        </div>
      );
    }
    if (procurements.length > 0) {
      return (
        <>
          <p className={styles.resultsCount}>{totalResults.toLocaleString('de-DE')} Ergebnisse gefunden.</p>
          <div className={styles.procurementList}>
            {procurements.map(proc => ( 
              <ProcurementListItem 
                key={proc.id} 
                procurement={proc} 
                onAskChatbot={toggleChatForProcurement} 
                onShowDetails={showDetails}
                onLike={handleLikeToggle}
                isLiked={likedIds.has(proc.id)}
              /> 
            ))}
          </div>
          {pagination.total_pages > 1 && (
            <div className={styles.footer}>
              <div className={styles.paginationControls}>
                <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page <= 1} className={commonStyles.buttonSecondary}>Zurück</button>
                <span>Seite {pagination.page} von {pagination.total_pages}</span>
                <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page >= pagination.total_pages} className={commonStyles.buttonSecondary}>Weiter</button>
              </div>
            </div>
          )}
        </>
      );
    }
    return null;
  };

  return (
    <>
      <div className={`${styles.pageContainer} ${isChatPanelOpen ? styles.chatPanelActive : ''}`}>
        <div className={styles.mainContentArea}>
          
          <header className={styles.header}>
            <h1>Alle öffentlichen Aufträge finden</h1>
            <p>Unsere Suchmaschine durchforstet alle Vergabeplattformen in Deutschland. Starten Sie Ihre Suche und verpassen Sie keine relevante Ausschreibung mehr.</p>
            <SearchForm 
              onSearch={handleSearch} 
              isLoading={isLoading} 
              onSaveSearch={handleSaveSearch}
              onReset={handleReset}
              savedSearches={savedSearches}
            />
          </header>

          <div className={styles.resultsArea}>
            {renderContent()}
          </div>
        </div>
        <ChatbotPanel isOpen={isChatPanelOpen} onClose={() => setIsChatPanelOpen(false)} procurementId={chatProcurementContext.id} procurementTitle={chatProcurementContext.title}/>
      </div>
      
      <XmlDetailModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        isLoading={isDetailLoading}
        error={detailError}
        llmSummaryHtml={llmSummaryHtml}
        fullTreeData={fullTreeData}
        isFullViewVisible={isFullViewVisible}
        toggleFullView={toggleFullView}
      />
    </>
  );
};

export default MatchingPage;
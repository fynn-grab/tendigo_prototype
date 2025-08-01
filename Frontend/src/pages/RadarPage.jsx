// src/pages/RadarPage.jsx
import React, { useState, useEffect } from 'react';
import { getSavedSearches, fetchProcurements, mapApiProcurementToFrontend, likeProcurement, unlikeProcurement, getLikedProcurements } from '../services/api';
import { useSettings } from '../contexts/SettingsContext';
import { useXmlDetailModal } from '../hooks/useXmlDetailModal';
import ProcurementListItem from '../components/common/ProcurementListItem';
import XmlDetailModal from '../components/common/XmlDetailModal';
import LoadingAnimation from '../components/common/LoadingAnimation';
import ChatbotPanel from '../components/common/ChatbotPanel';
import styles from './RadarPage.module.css';
import commonStyles from '../components/common/Common.module.css';
import { Radar, Inbox, History } from 'lucide-react';

// Helper to group items by date (robust against invalid values)
const getRelativeDateLabel = (dateString) => {
  if (!dateString) return 'Ohne Datum';
  const itemDate = new Date(dateString);
  if (isNaN(itemDate.getTime())) return 'Ohne Datum';

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);
  itemDate.setHours(0, 0, 0, 0);

  if (itemDate.getTime() === today.getTime()) return 'Heute';
  if (itemDate.getTime() === yesterday.getTime()) return 'Gestern';
  return new Intl.DateTimeFormat('de-DE', { year: 'numeric', month: 'long', day: 'numeric' }).format(itemDate);
};

const RadarPage = () => {
  const { buildRequestBody } = useSettings();
  const { isModalOpen, isLoading: isDetailLoading, error: detailError, llmSummaryHtml, fullTreeData, isFullViewVisible, toggleFullView, showDetails, closeModal } = useXmlDetailModal();
  
  const [savedSearches, setSavedSearches] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [feedItems, setFeedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);
  const [chatProcurementContext, setChatProcurementContext] = useState({ id: null, title: null });
  const [likedIds, setLikedIds] = useState(new Set());
  
  const [lastVisit, setLastVisit] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [newItemCount, setNewItemCount] = useState(0);
  const [archivePagination, setArchivePagination] = useState({ page: 1, total_pages: 0, total_items: 0 });

  useEffect(() => {
    const storedLastVisit = localStorage.getItem('radar_lastVisit');
    if (storedLastVisit) setLastVisit(new Date(storedLastVisit));
    return () => localStorage.setItem('radar_lastVisit', new Date().toISOString());
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [profiles, liked] = await Promise.all([getSavedSearches(), getLikedProcurements()]);
        setSavedSearches(profiles);
        setLikedIds(new Set(liked.map(item => item.id)));
      } catch (err) {
        setError("Fehler beim Laden der Suchprofile.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchFeedForProfiles = async () => {
      if (!selectedProfileId) {
        setFeedItems([]);
        setNewItemCount(0);
        return;
      }
      setIsLoading(true);
      setError(null);

      const selectedProfile = savedSearches.find(p => p.id === selectedProfileId);
      // Correctly get criteria from the single selected profile
      const criteria = selectedProfile ? selectedProfile.params.criteria : [];
      if (!selectedProfile) {
        setIsLoading(false);
        return;
      }

      const requestParams = {
        criteria: criteria,
        publicationDate: showAll ? null : (lastVisit || new Date()),
        page: showAll ? archivePagination.page : 1,
      };

      try {
        const requestBody = buildRequestBody(requestParams);
        const response = await fetchProcurements(requestBody);
        
        const newItems = (response.data || []).map(mapApiProcurementToFrontend);
        const uniqueItems = Array.from(new Map(newItems.map(item => [item.id, item])).values());
        
        uniqueItems.sort((a, b) => new Date(b._raw.publication_date) - new Date(a._raw.publication_date));

        if (showAll) {
          setArchivePagination({ page: response.page, total_pages: response.total_pages, total_items: response.total_items });
        } else {
          setNewItemCount(response.total_items);
        }
        setFeedItems(uniqueItems);

      } catch (err) {
        setError("Der Feed konnte nicht geladen werden.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeedForProfiles();
  }, [selectedProfileId, savedSearches, buildRequestBody, lastVisit, showAll, archivePagination.page]);

  const handleProfileSelect = (profileId) => {
    setSelectedProfileId(prevId => (prevId === profileId ? null : profileId));
    setArchivePagination(prev => ({...prev, page: 1}));
  };
  
  const handleToggleShowAll = () => {
      setShowAll(prev => !prev);
      setArchivePagination(prev => ({...prev, page: 1}));
  }
  
  const handleArchivePageChange = (newPage) => {
      if (newPage > 0 && newPage <= archivePagination.total_pages) {
          setArchivePagination(prev => ({...prev, page: newPage}));
          window.scrollTo(0, 0);
      }
  }

  const handleLikeToggle = async (procurement) => {
    const newLikedIds = new Set(likedIds);
    if (likedIds.has(procurement.id)) await unlikeProcurement(procurement.id), newLikedIds.delete(procurement.id);
    else await likeProcurement(procurement), newLikedIds.add(procurement.id);
    setLikedIds(newLikedIds);
  };
  
  const toggleChatForProcurement = (procurement) => {
    setChatProcurementContext({ id: procurement.id, title: procurement.title });
    setIsChatPanelOpen(true);
  };

  const groupedItems = feedItems.reduce((acc, item) => {
    const groupName = getRelativeDateLabel(item._raw.publication_date);
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(item);
    return acc;
  }, {});
  
  const renderContent = () => {
    if (isLoading && feedItems.length === 0) return <LoadingAnimation />;
    if (error) return <div className={styles.placeholder}><p>{error}</p></div>;
    if (!selectedProfileId) {
      return (
        <div className={styles.placeholder}>
          <Radar size={48} /><h2>Ihr persönlicher Radar</h2>
          <p>Wählen Sie oben ein Suchprofil aus, um Ihren persönlichen Feed zu starten.</p>
        </div>
      );
    }
    if (feedItems.length === 0 && !isLoading) {
      return (
        <div className={styles.placeholder}>
          <Inbox size={48} /><h2>Keine Treffer</h2>
          <p>{showAll ? 'Für dieses Profil wurden im Archiv keine Ausschreibungen gefunden.' : 'Seit Ihrem letzten Besuch wurden keine neuen Ausschreibungen gefunden.'}</p>
          {!showAll && <button onClick={handleToggleShowAll} className={styles.historyButton}><History size={16}/> Archiv durchsuchen</button>}
        </div>
      );
    }

    return (
      <>
        {Object.entries(groupedItems).map(([groupName, items]) => (
          <div key={groupName} className={styles.dateGroup}>
            <h3 className={styles.dateHeader}>{groupName}</h3>
            {items.map(proc => <ProcurementListItem key={proc.id} procurement={proc} onAskChatbot={toggleChatForProcurement} onShowDetails={showDetails} onLike={handleLikeToggle} isLiked={likedIds.has(proc.id)} />)}
          </div>
        ))}
        <div className={styles.footerActions}>
          {showAll && archivePagination.total_pages > 1 && (
             <div className={styles.paginationControls}>
                <button onClick={() => handleArchivePageChange(archivePagination.page - 1)} disabled={archivePagination.page <= 1} className={commonStyles.buttonSecondary}>Zurück</button>
                <span>Seite {archivePagination.page} von {archivePagination.total_pages}</span>
                <button onClick={() => handleArchivePageChange(archivePagination.page + 1)} disabled={archivePagination.page >= archivePagination.total_pages} className={commonStyles.buttonSecondary}>Weiter</button>
              </div>
          )}
          <button onClick={handleToggleShowAll} className={styles.historyButton}><History size={16}/>{showAll ? 'Nur neue Ausschreibungen anzeigen' : 'Gesamtes Archiv durchsuchen'}</button>
        </div>
      </>
    );
  };

  return (
    <>
      <div className={`${styles.pageContainer} ${isChatPanelOpen ? styles.chatPanelActive : ''}`}>
        <header className={styles.header}>
          <h1>Radar</h1><p>Ihr personalisierter Feed basierend auf Ihren gespeicherten Suchen.</p>
          <div className={styles.profileSelectorContainer}>
            <div className={styles.profileSelectionHeader}>
              <h4>Profil auswählen</h4>
            </div>
            <div className={styles.profileSelector}>
              {savedSearches.map(profile => (<button key={profile.id} onClick={() => handleProfileSelect(profile.id)} className={`${styles.profileChip} ${selectedProfileId === profile.id ? styles.active : ''}`}>{profile.name}</button>))}
            </div>
          </div>
        </header>

        {selectedProfileId && !isLoading && (
           <div className={styles.feedStatus}>
            {showAll ? (
              `Archiv: ${archivePagination.total_items.toLocaleString('de-DE')} Ausschreibungen gefunden.`
            ) : (
              <>
                <strong>{newItemCount.toLocaleString('de-DE')} neue Ausschreibungen</strong>
                {' seit Ihrem letzten Besuch.'}
              </>
            )}
           </div>
        )}

        <main className={styles.feedContent}>{renderContent()}</main>
      </div>
      
      <ChatbotPanel isOpen={isChatPanelOpen} onClose={() => setIsChatPanelOpen(false)} procurementId={chatProcurementContext.id} procurementTitle={chatProcurementContext.title} />
      <XmlDetailModal isOpen={isModalOpen} onClose={closeModal} isLoading={isDetailLoading} error={detailError} llmSummaryHtml={llmSummaryHtml} fullTreeData={fullTreeData} isFullViewVisible={isFullViewVisible} toggleFullView={toggleFullView} />
    </>
  );
};

export default RadarPage;
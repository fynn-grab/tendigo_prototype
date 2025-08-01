// src/components/common/XmlDetailModal.jsx
import React from 'react';
import styles from './XmlDetailModal.module.css';
import { X, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

const FullTreeView = ({ node }) => {
  const hasChildren = node.children && node.children.length > 0;
  const hasText = node.text && node.text.trim();
  return (
    <div className={styles.node}>
      <div className={styles.tagLine}>
        <span className={styles.tag}>{`<${node.tagName}`}</span>
        {Object.entries(node.attributes).map(([key, value]) => (
          <span key={key} className={styles.attribute}>{' '}<span className={styles.attrName}>{key}</span>=<span className={styles.attrValue}>{`"${value}"`}</span></span>
        ))}
        <span className={styles.tag}>{`>`}</span>
      </div>
      <div className={styles.content}>
        {hasText && <div className={styles.textContent}>{node.text}</div>}
        {hasChildren && node.children.map((child, index) => <FullTreeView key={index} node={child} />)}
      </div>
      {hasChildren && <div className={styles.tagLine}><span className={styles.tag}>{`</${node.tagName}>`}</span></div>}
    </div>
  );
};

const XmlDetailModal = ({ isOpen, onClose, isLoading, error, llmSummaryHtml, fullTreeData, isFullViewVisible, toggleFullView }) => {
  if (!isOpen) return null;
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          {/* Wrapped title and subtitle for better layout */}
          <div>
            <h3>Zusammenfassung</h3>
            <p className={styles.modalSubtitle}>Unsere KI extrahiert die wichtigsten Informationen aus den Originaldokumenten.</p>
          </div>
          <button onClick={onClose} className={styles.closeButton}><X size={24} /></button>
        </div>
        <div className={styles.dataContainer}>
          {isLoading && (
            <div className={styles.status}><Loader2 className="animate-spin" size={32} /><p>Zusammenfassung wird generiert...</p></div>
          )}
          {error && <div className={styles.status}>{error}</div>}
          
          {!isLoading && llmSummaryHtml && (
            <div className={styles.summarySection}>
              <div dangerouslySetInnerHTML={{ __html: llmSummaryHtml }} />
            </div>
          )}
          {!isLoading && fullTreeData && (
            <div className={styles.detailsToggleSection}>
              <button onClick={toggleFullView} className={styles.toggleButton}>
                <span>{isFullViewVisible ? 'Rohdaten ausblenden' : 'Rohdaten anzeigen'}</span>
                {isFullViewVisible ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {isFullViewVisible && (
                <div className={styles.fullTreeContainer}>
                  <FullTreeView node={fullTreeData} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default XmlDetailModal;
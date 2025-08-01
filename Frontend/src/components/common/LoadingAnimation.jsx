// src/components/common/LoadingAnimation.jsx
import React, { useState, useEffect, useRef } from 'react';
import styles from './LoadingAnimation.module.css';

// The initial list of search actions.
const initialSearchTexts = [
   "Starte Suchvorgang...",
  "Durchsuche Ausschreibungsportal Nordrhein-Westfalen...",
  "Durchsuche Vergabeplattform Hessen...",
  "Durchsuche EU Procurement Data Space...",
  "Durchsuche Bekanntmachungen aus Baden-Württemberg...",
  "Durchsuche Ausschreibungsdatenbank Bayern...",
  "Durchsuche Veröffentlichungen im Bundesanzeiger...",
  "Durchsuche Ausschreibungsplattform Sachsen...",
  "Durchsuche TED (Tenders Electronic Daily)...",
  "Durchsuche CPV-Code-Verzeichnis...",
  "Durchsuche Vergabeplattform Niedersachsen...",
  "Durchsuche Ausschreibungen für Hamburg...",
  "Durchsuche XML-Daten veröffentlichter Bekanntmachungen...",
  "Durchsuche Vergabemarktplatz Brandenburg...",
  "Durchsuche zentrale Vergabedatenbanken...",
  "Durchsuche konsolidierte Ausschreibungsquellen...",

  "Durchsuche Vergabeplattform Berlin...",
  "Durchsuche Bekanntmachungen aus Rheinland-Pfalz...",
  "Durchsuche Vergabeportal Schleswig-Holstein...",
  "Durchsuche Veröffentlichungen aus Thüringen...",
  "Durchsuche Ausschreibungen des Saarlands...",
  "Durchsuche Vergabeplattform Sachsen-Anhalt...",
  "Durchsuche Bekanntmachungen aus Bremen...",
  "Durchsuche Ausschreibungsdatenbank Mecklenburg-Vorpommern...",
];

// Phase 2: Standard finalizing message.
const finalizingText = "Finalisiere Ergebnisse...";

// Phase 3: Extended message for longer waits.
const extendedFinalizingText = "Finalisiere Suchergebnisse... Bitte haben Sie einen Moment Geduld – aktuell werden mehrere hunderttausend Ausschreibungen durchsucht.";

const LoadingAnimation = () => {
  const [currentText, setCurrentText] = useState(initialSearchTexts[0]);
  
  // Refs to hold timer IDs for proper cleanup.
  const initialLoopTimerRef = useRef(null);
  const extendedMessageTimerRef = useRef(null);

  useEffect(() => {
    let index = 0;

    // Phase 1: Interval to loop through the initial search texts.
    initialLoopTimerRef.current = setInterval(() => {
      if (index < initialSearchTexts.length - 1) {
        index++;
        setCurrentText(initialSearchTexts[index]);
      } else {
        // End of initial list reached. Stop this interval.
        clearInterval(initialLoopTimerRef.current);
        
        // Enter Phase 2: Show the standard finalizing message.
        setCurrentText(finalizingText);

        // Start a 10-second timer for the extended message.
        extendedMessageTimerRef.current = setTimeout(() => {
          // Enter Phase 3: Show the extended message.
          setCurrentText(extendedFinalizingText);
        }, 10000); // 10 seconds
      }
    }, 1200);

    // Cleanup function: This is crucial to prevent memory leaks.
    // It runs when the component unmounts (i.e., when results arrive).
    return () => {
      clearInterval(initialLoopTimerRef.current);
      clearTimeout(extendedMessageTimerRef.current);
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount.

  return (
    <div className={styles.loadingContainer}>
      <div className={styles.scanner}></div>
      <div className={styles.loadingText}>
        {currentText}
      </div>
    </div>
  );
};

export default LoadingAnimation;
// src/components/common/InitialSearchPlaceholder.jsx
import React from 'react';
import { Search } from 'lucide-react';
import listItemStyles from './ProcurementListItem.module.css';
import placeholderStyles from './InitialSearchPlaceholder.module.css';

const InitialSearchPlaceholder = () => {
  return (
    <div className={`${listItemStyles.listItem} ${placeholderStyles.placeholderContainer}`}>
      <div className={placeholderStyles.content}>
        <Search size={48} className={placeholderStyles.icon} />
        <h2 className={placeholderStyles.title}>
          Alle Ausschreibungen Deutschlands an einem Ort
        </h2>
        <p className={placeholderStyles.text}>
          Wir durchsuchen täglich hunderte Vergabeportale von Bund, Ländern und Kommunen, damit Sie nichts mehr verpassen. Starten Sie oben Ihre Suche.
        </p>
      </div>
    </div>
  );
};

export default InitialSearchPlaceholder;
// src/components/search/SearchForm.jsx
import React, { useState } from 'react';
// Note: Imports for external packages and CSS modules are removed to ensure compatibility.
// Styles are now embedded in the component.
import { RotateCcw, Search, PlusCircle, XCircle, Calendar, Save } from 'lucide-react';

// Embedded CSS to avoid resolution errors
const styles = `
.search-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
  background-color: var(--color-surface);
  padding: var(--spacing-5);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
}
.search-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}
.criterion-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-wrap: wrap; /* Allow wrapping on smaller screens */
}
.operator-select {
  flex-basis: 90px;
  flex-shrink: 0;
}
.first-criterion-row .operator-select {
  display: none;
}
.search-input-wrapper {
  flex-grow: 1;
  min-width: 200px;
  height: 44px;
}
.criterion-select {
  padding: var(--spacing-2) var(--spacing-3);
  background-color: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  color: var(--color-text);
  font-weight: 500;
  height: 44px;
  flex-shrink: 0;
  transition: border-color 0.2s;
  -webkit-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%238B949E' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}
.criterion-select:hover {
  border-color: var(--color-border-hover);
}
.search-input {
  width: 100%; height: 100%;
  padding: var(--spacing-2) var(--spacing-3);
  background-color: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  color: var(--color-text-emphasis);
  font-size: var(--fs-base);
}
.search-input::placeholder {
  color: var(--color-text-muted);
}
.add-criterion-container {
  padding-left: calc(90px + var(--spacing-3));
}
.first-criterion-row .add-criterion-container {
  padding-left: 0;
}
.add-button, .remove-button {
  background: none; border: none; cursor: pointer;
  color: var(--color-text-muted); display: flex;
  align-items: center; gap: var(--spacing-2);
  transition: color 0.2s; padding: var(--spacing-1);
}
.add-button {
  font-size: var(--fs-sm); font-weight: 500;
  color: var(--color-primary);
  border-radius: var(--border-radius);
}
.add-button:hover {
  color: var(--color-primary-hover);
}
.remove-button {
    border-radius: var(--border-radius-full);
}
.remove-button:hover {
    color: var(--color-danger);
}
.bottom-controls {
  display: flex;
  gap: var(--spacing-4);
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-top: var(--spacing-2);
  padding-top: var(--spacing-5);
  border-top: 1px solid var(--color-border);
}
.date-filters {
  display: flex;
  gap: var(--spacing-4);
  align-items: center;
  flex-wrap: wrap;
}
.date-picker-container {
  display: flex; align-items: center; gap: var(--spacing-3);
  background-color: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  padding: 0 var(--spacing-3);
  height: 44px;
}
.date-picker-container label {
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
  font-weight: 500;
  white-space: nowrap;
  flex-basis: 125px; /* Set fixed basis for alignment */
  flex-shrink: 0;
}
.date-picker-container svg { color: var(--color-text-muted); }
.date-picker-input {
  background: transparent !important;
  border: none !important;
  color: var(--color-text-emphasis) !important;
  width: auto; /* Let input grow */
  flex-grow: 1;
  height: 100%;
  padding: 0 !important;
  font-weight: 500;
  font-family: inherit;
  color-scheme: dark;
}
.date-picker-input:focus { outline: none; }
.main-actions {
  display: flex;
  gap: var(--spacing-3);
  flex-wrap: wrap;
}
.action-button {
  height: 44px;
  display: flex; align-items: center;
  gap: var(--spacing-2);
  font-size: var(--fs-sm);
  padding: var(--spacing-2) var(--spacing-3);
}

/* From Common.module.css */
.button-primary, .button-secondary {
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--border-radius);
  font-weight: 600;
  font-size: var(--fs-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.button-primary {
  background-color: var(--color-primary);
  color: var(--color-background);
  border-color: var(--color-primary);
}
.button-primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}
.button-primary:disabled {
  background-color: var(--color-border);
  cursor: not-allowed;
}
.button-secondary {
  background-color: var(--color-surface-alt);
  color: var(--color-text-emphasis);
  border: 1px solid var(--color-border);
}
.button-secondary:hover:not(:disabled) {
  background-color: #2e343d;
  border-color: var(--color-border-hover);
}

@media (max-width: 992px) {
  .bottom-controls {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-3);
  }
  .date-filters {
    width: 100%;
    justify-content: space-between;
  }
  .main-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .search-form {
    padding: var(--spacing-4);
  }
  .criterion-row {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-2);
  }
  .criterion-row .operator-select,
  .criterion-row .search-input-wrapper,
  .criterion-row .criterion-select {
    flex-basis: auto;
    min-width: 100%;
  }
  .first-criterion-row .operator-select {
    display: none;
  }
  .add-criterion-container,
  .first-criterion-row .add-criterion-container {
    padding-left: 0;
  }
  .date-filters {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-2);
  }
  .main-actions {
    flex-direction: column-reverse;
    gap: var(--spacing-2);
  }
}
`;

const SearchForm = ({ onSearch, isLoading, onSaveSearch, onReset, savedSearches }) => {
  const [criteria, setCriteria] = useState([{ id: 1, term: '', operator: null, scope: 'both', negate: false, search_mode: 'like' }]);
  const [publicationDate, setPublicationDate] = useState(new Date(2025, 2, 1));
  const [submissionStartDate, setSubmissionStartDate] = useState(null);
  const [submissionEndDate, setSubmissionEndDate] = useState(null);

  const updateCriterion = (id, field, value) => {
    setCriteria(criteria.map(c => (c.id === id ? { ...c, [field]: value } : c)));
  };
  const addCriterion = () => {
    setCriteria([...criteria, { id: Date.now(), term: '', operator: 'AND', scope: 'both', negate: false, search_mode: 'like' }]);
  };
  const removeCriterion = (id) => {
    if (criteria.length > 1) setCriteria(criteria.filter(c => c.id !== id));
  };

  const dateToInputValue = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const inputValueToDate = (value) => {
    if (!value) return null;
    return new Date(`${value}T00:00:00`); // Interpret as local time
  };

  const getSearchParams = () => ({
    criteria,
    publicationDate,
    submissionStartDate,
    submissionEndDate
  });
  
  const handleLoadProfile = (e) => {
    const profileId = e.target.value;
    if (!profileId) {
        handleReset();
        return;
    }
    const profile = savedSearches.find(s => s.id.toString() === profileId);
    if (profile && profile.params) {
        setCriteria(profile.params.criteria || [{ id: 1, term: '', operator: null, scope: 'both', negate: false, search_mode: 'like' }]);
        setPublicationDate(profile.params.publicationDate ? new Date(profile.params.publicationDate) : null);
        setSubmissionStartDate(profile.params.submissionStartDate ? new Date(profile.params.submissionStartDate) : null);
        setSubmissionEndDate(profile.params.submissionEndDate ? new Date(profile.params.submissionEndDate) : null);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(getSearchParams());
  };

  const handleSave = () => {
    onSaveSearch(getSearchParams());
  };

  const handleReset = () => {
    setCriteria([{ id: 1, term: '', operator: null, scope: 'both', negate: false, search_mode: 'like' }]);
    setPublicationDate(null);
    setSubmissionStartDate(null);
    setSubmissionEndDate(null);
    
    const selector = document.getElementById('profile-selector');
    if (selector) selector.value = '';

    if (onReset) {
      onReset();
    }
  };

  return (
    <>
      <style>{styles}</style>
      <form onSubmit={handleSearchSubmit} className="search-form">
        <div className="search-grid">
          {criteria.map((c, index) => (
            <div key={c.id} className={`criterion-row ${index === 0 ? 'first-criterion-row' : ''}`}>
              {index > 0 && <select value={c.operator} onChange={(e) => updateCriterion(c.id, 'operator', e.target.value)} className="criterion-select operator-select"><option value="AND">UND</option><option value="OR">ODER</option></select>}
              <div className="search-input-wrapper"><input type="text" value={c.term} onChange={(e) => updateCriterion(c.id, 'term', e.target.value)} placeholder={index === 0 ? "Suchbegriff eingeben..." : "Weiterer Begriff..."} className="search-input" /></div>
              
              <select value={c.search_mode} onChange={(e) => updateCriterion(c.id, 'search_mode', e.target.value)} className="criterion-select">
                <option value="like">Normale Suche</option>
                <option value="fts">Intelligente Suche</option>
              </select>

              {c.search_mode === 'like' && (
                <select value={c.scope} onChange={(e) => updateCriterion(c.id, 'scope', e.target.value)} className="criterion-select">
                  <option value="both">Titel/Text</option>
                  <option value="title">Nur Titel</option>
                  <option value="description">Nur Text</option>
                </select>
              )}

              <select value={c.negate} onChange={(e) => updateCriterion(c.id, 'negate', e.target.value === 'true')} className="criterion-select"><option value={false}>enthält</option><option value={true}>enthält nicht</option></select>
              {criteria.length > 1 && <button type="button" onClick={() => removeCriterion(c.id)} className="remove-button" title="Begriff entfernen"><XCircle size={18} /></button>}
            </div>
          ))}
          <div className={`add-criterion-container ${criteria.length === 1 ? 'first-criterion-row' : ''}`}>
            <button type="button" onClick={addCriterion} className="add-button"><PlusCircle size={16}/> Suchzeile hinzufügen</button>
          </div>
        </div>

        <div className="bottom-controls">
          <div className="date-filters">
            <div className="date-picker-container">
              <Calendar size={20}/>
              <label>Veröffentlicht nach</label>
              <input type="date" value={dateToInputValue(publicationDate)} onChange={(e) => setPublicationDate(inputValueToDate(e.target.value))} className="date-picker-input"/>
            </div>
            <div className="date-picker-container">
              <Calendar size={20}/>
              <label>Frist-Start ab</label>
              <input type="date" value={dateToInputValue(submissionStartDate)} onChange={(e) => setSubmissionStartDate(inputValueToDate(e.target.value))} className="date-picker-input"/>
            </div>
            <div className="date-picker-container">
              <Calendar size={20}/>
              <label>Frist-Ende bis</label>
              <input type="date" value={dateToInputValue(submissionEndDate)} onChange={(e) => setSubmissionEndDate(inputValueToDate(e.target.value))} className="date-picker-input"/>
            </div>
          </div>
          <div className="main-actions">
            <select id="profile-selector" onChange={handleLoadProfile} className="criterion-select" title="Gespeichertes Suchprofil laden">
                <option value="">Suchprofil auswählen...</option>
                {savedSearches && savedSearches.map(profile => (
                    <option key={profile.id} value={profile.id}>{profile.name}</option>
                ))}
            </select>
            <button type="button" onClick={handleReset} className="button-secondary action-button" disabled={isLoading}>
              <RotateCcw size={16}/> Zurücksetzen
            </button>
            <button type="button" onClick={handleSave} className="button-secondary action-button" disabled={isLoading}>
              <Save size={18}/> Suchprofil speichern
            </button>
            <button type="submit" className="button-primary action-button" disabled={isLoading}>
              {isLoading ? <RotateCcw size={18} className="animate-spin"/> : <><Search size={18}/> Suchen</>}
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default SearchForm;
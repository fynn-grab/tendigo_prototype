// src/pages/SettingsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import styles from './SettingsPage.module.css';
import commonStyles from '../components/common/Common.module.css';
import { Mail, Bell, Trash2, Tag, Save, Users, Edit, Plus, X, ListChecks, UserPlus } from 'lucide-react';
import { getSavedSearches, deleteSavedSearch, updateSavedSearch, getTeamMembers, saveTeamMember, deleteTeamMember, getStandardTodos, saveStandardTodos } from '../services/api';

// --- Sub-Components ---
const TeamMemberModal = ({ member, onSave, onClose }) => {
  const [currentMember, setCurrentMember] = useState(member);

  useEffect(() => {
    setCurrentMember(member);
  }, [member]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentMember(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(currentMember);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className={styles.modalHeader}>
            <h3>{member.id ? 'Teammitglied bearbeiten' : 'Neues Teammitglied'}</h3>
            <button type="button" onClick={onClose} className={styles.closeButton}><X size={24} /></button>
          </div>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Name</label>
              <input id="name" name="name" type="text" value={currentMember.name} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="role">Position / Rolle</label>
              <input id="role" name="role" type="text" value={currentMember.role} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">E-Mail</label>
              <input id="email" name="email" type="email" value={currentMember.email} onChange={handleChange} required />
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={commonStyles.buttonSecondary}>Abbrechen</button>
            <button type="submit" className={commonStyles.buttonPrimary}><Save size={16} /> Speichern</button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- Main Component ---
const SettingsPage = () => {
  const [email, setEmail] = useState('');
  const [isEmailSaved, setIsEmailSaved] = useState(false);
  const [savedSearches, setSavedSearches] = useState([]);
  const [team, setTeam] = useState([]);
  const [standardTodos, setStandardTodos] = useState([]);
  const [isTodosSaved, setIsTodosSaved] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const fetchData = useCallback(async () => {
    setEmail(localStorage.getItem('notification_email') || '');
    setSavedSearches(await getSavedSearches());
    setTeam(await getTeamMembers());
    setStandardTodos(await getStandardTodos());
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleEmailSave = (e) => {
    e.preventDefault();
    localStorage.setItem('notification_email', email);
    setIsEmailSaved(true);
    setTimeout(() => setIsEmailSaved(false), 2000);
  };

  // --- Search Management ---
  const handleDeleteSearch = async (id) => {
    if (window.confirm("Gespeicherte Suche löschen?")) {
      await deleteSavedSearch(id);
      fetchData();
    }
  };

  // --- Team Management ---
  const handleOpenModal = (member = { id: null, name: '', role: '', email: '' }) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };
  
  const handleSaveMember = async (member) => {
    await saveTeamMember(member);
    setIsModalOpen(false);
    fetchData();
  };

  const handleDeleteMember = async (id) => {
    if (window.confirm("Teammitglied entfernen?")) {
      await deleteTeamMember(id);
      fetchData();
    }
  };

  // --- Standard Todos Management ---
  const handleTodoChange = (index, value) => {
    const updatedTodos = [...standardTodos];
    updatedTodos[index] = value;
    setStandardTodos(updatedTodos);
  };
  
  const handleAddTodo = () => setStandardTodos([...standardTodos, '']);
  
  const handleDeleteTodo = (index) => setStandardTodos(standardTodos.filter((_, i) => i !== index));

  const handleSaveTodos = async () => {
    await saveStandardTodos(standardTodos.filter(t => t.trim() !== ''));
    setIsTodosSaved(true);
    setTimeout(() => setIsTodosSaved(false), 2000);
    fetchData(); // to remove empty ones
  };

  return (
    <div className={styles.settingsPage}>
      {isModalOpen && <TeamMemberModal member={editingMember} onSave={handleSaveMember} onClose={() => setIsModalOpen(false)} />}
      <header className={styles.header}>
        <h1>Einstellungen & Administration</h1>
        <p>Verwalten Sie Benachrichtigungen, Suchprofile, Teammitglieder und interne Prozesse.</p>
      </header>

      <div className={styles.settingsGrid}>
        {/* Team Management Card */}
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <Users size={22} className={styles.cardIcon} />
            <h3>Teamverwaltung</h3>
            <button onClick={() => handleOpenModal()} className={`${commonStyles.buttonPrimary} ${styles.headerButton}`}><UserPlus size={16} /> Hinzufügen</button>
          </div>
          <div className={styles.cardBody}>
            <ul className={styles.itemList}>
              {team.map(member => (
                <li key={member.id} className={styles.item}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{member.name}</span>
                    <span className={styles.itemSubline}>{member.role} • {member.email}</span>
                  </div>
                  <div className={styles.itemControls}>
                    <button onClick={() => handleOpenModal(member)} className={styles.controlButton} title="Bearbeiten"><Edit size={18} /></button>
                    <button onClick={() => handleDeleteMember(member.id)} className={`${styles.controlButton} ${styles.deleteButton}`} title="Löschen"><Trash2 size={18} /></button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Standard Process Card */}
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <ListChecks size={22} className={styles.cardIcon} />
            <h3>Standard-Angebotsprozess</h3>
          </div>
          <div className={styles.cardBody}>
            <p>Definieren Sie die Standard-Aufgaben, die für neue Verfahren im Angebots-Cockpit angelegt werden.</p>
             <div className={styles.todoList}>
              {standardTodos.map((todo, index) => (
                <div key={index} className={styles.todoItem}>
                  <input type="text" value={todo} onChange={(e) => handleTodoChange(index, e.target.value)} placeholder="Aufgabentext..."/>
                  <button onClick={() => handleDeleteTodo(index)} className={`${styles.controlButton} ${styles.deleteButton}`}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
            <div className={styles.cardFooter}>
                <button onClick={handleAddTodo} className={commonStyles.buttonSecondary}><Plus size={16}/> Aufgabe hinzufügen</button>
                <button onClick={handleSaveTodos} className={commonStyles.buttonPrimary}><Save size={16} /> {isTodosSaved ? 'Gespeichert!' : 'Prozess speichern'}</button>
            </div>
          </div>
        </div>
        
        {/* Saved Searches Card */}
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}><Bell size={22} className={styles.cardIcon} /><h3>Gespeicherte Suchen</h3></div>
          <div className={styles.cardBody}>
            <ul className={styles.itemList}>
              {savedSearches.length > 0 ? savedSearches.map(search => (
                <li key={search.id} className={styles.item}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{search.name}</span>
                    <span className={styles.itemSubline}><Tag size={14}/> {search.params?.criteria.map(c => `"${c.term}"`).join(' ')}</span>
                  </div>
                  <div className={styles.itemControls}>
                    <select value={search.interval} onChange={(e) => updateSavedSearch(search.id, { interval: e.target.value })}>
                      <option value="daily">Täglich</option>
                      <option value="weekly">Wöchentlich</option>
                    </select>
                    <button onClick={() => handleDeleteSearch(search.id)} className={`${styles.controlButton} ${styles.deleteButton}`}><Trash2 size={18} /></button>
                  </div>
                </li>
              )) : (<p className={styles.noItems}>Keine Suchen gespeichert.</p>)}
            </ul>
          </div>
        </div>

        {/* Email Notification Card */}
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}><Mail size={22} className={styles.cardIcon} /><h3>E-Mail Benachrichtigungen</h3></div>
          <div className={styles.cardBody}>
            <form onSubmit={handleEmailSave} className={styles.emailForm}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ihre.email@firma.de" required />
              <button type="submit" className={commonStyles.buttonPrimary}><Save size={16} /> {isEmailSaved ? 'Gespeichert!' : 'Speichern'}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
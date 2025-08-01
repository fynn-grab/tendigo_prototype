// src/pages/CockpitPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getLikedProcurements, unlikeProcurement, getProcurementMetadata, updateProcurementMetadata, getTeamMembers, getStandardTodos } from '../services/api';
import styles from './CockpitPage.module.css';
import commonStyles from '../components/common/Common.module.css';
import { Info, Target, Clock, Users, Trash2, Send, Plus, CheckSquare, Square, ExternalLink, Mail, X, CornerUpLeft, FileText, Edit2, PlayCircle } from 'lucide-react';

// --- Static Data ---
const STATUS_OPTIONS = {
  in_prüfung: { label: "In Prüfung", color: "var(--color-primary)" },
  abgelehnt: { label: "Abgelehnt (No-Go)", color: "var(--color-danger)" },
  in_bearbeitung: { label: "In Bearbeitung", color: "var(--color-warning)" },
  abgegeben: { label: "Angebot abgegeben", color: "#A279FF" },
  gewonnen: { label: "Gewonnen", color: "var(--color-success)" },
  verloren: { label: "Verloren", color: "var(--color-text-muted)" },
};

const DEFAULT_METADATA = { todos: [], activityLog: [], assignedTo: null, status: 'in_prüfung', notes: '' };

// --- Helper Components ---
const ForwardingModal = ({ item, team, onClose, onForward }) => {
  const [recipientId, setRecipientId] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const recipient = team.find(u => u.id === recipientId);
    if (recipient) onForward(recipient, message || "Bitte um Prüfung dieser Ausschreibung.");
  };

  return (
     <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}><h3>Ausschreibung weiterleiten</h3><button onClick={onClose} className={styles.closeModalButton}><X size={24} /></button></div>
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <p><strong>Ausschreibung:</strong> {item.title}</p>
            <div className={styles.formGroup}><label htmlFor="recipient"><Mail size={16}/> Empfänger</label><select id="recipient" value={recipientId} onChange={e => setRecipientId(e.target.value)} required><option value="" disabled>Teammitglied auswählen...</option>{team.map(user => <option key={user.id} value={user.id}>{user.name} ({user.role})</option>)}</select></div>
            <div className={styles.formGroup}><label htmlFor="message"><Edit2 size={16}/> Persönliche Nachricht (optional)</label><textarea id="message" value={message} onChange={e => setMessage(e.target.value)} rows="4" placeholder="z.B. Bitte die technischen Anforderungen prüfen..."></textarea></div>
          </div>
          <div className={styles.modalFooter}><button type="button" onClick={onClose} className={commonStyles.buttonSecondary}>Abbrechen</button><button type="submit" className={commonStyles.buttonPrimary}><Send size={16}/> Senden</button></div>
        </form>
      </div>
    </div>
  );
};

// --- Main Component ---
const CockpitPage = () => {
  const [likedItems, setLikedItems] = useState([]);
  const [metadata, setMetadata] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [newTodoText, setNewTodoText] = useState('');
  const [isForwardModalOpen, setForwardModalOpen] = useState(false);
  const [team, setTeam] = useState([]);
  const [standardTodos, setStandardTodos] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [items, meta, teamData, todosData] = await Promise.all([getLikedProcurements(), getProcurementMetadata(), getTeamMembers(), getStandardTodos()]);
      setLikedItems(items);
      setMetadata(meta);
      setTeam(teamData);
      setCurrentUser(teamData[0] || null); // Assume first user is current user
      setStandardTodos(todosData);
      if (items.length > 0 && !selectedItemId) setSelectedItemId(items[0].id);
      else if (items.length === 0) setSelectedItemId(null);
    } catch (error) {
      console.error("Error loading cockpit data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedItemId]);

  useEffect(() => { fetchData(); }, [fetchData]);
  
  const logActivity = (itemId, text) => {
    const logEntry = { id: Date.now(), text, user: currentUser?.name || 'System', timestamp: new Date().toISOString() };
    const currentMeta = metadata[itemId] || DEFAULT_METADATA;
    return [logEntry, ...currentMeta.activityLog];
  };

  const handleUpdateMetadata = useCallback((itemId, updates, activityText) => {
    const currentMeta = metadata[itemId] || DEFAULT_METADATA;
    let newMeta = { ...currentMeta, ...updates };
    if (activityText) newMeta.activityLog = logActivity(itemId, activityText);
    updateProcurementMetadata(itemId, newMeta);
    setMetadata(prev => ({ ...prev, [itemId]: newMeta }));
  }, [metadata, currentUser]);

  const handleUnlike = async (procurementId) => {
    await unlikeProcurement(procurementId);
    setSelectedItemId(null);
    fetchData();
  };
  
  const selectedItem = likedItems.find(item => item.id === selectedItemId);
  const selectedItemMeta = (selectedItem && metadata[selectedItem.id]) || DEFAULT_METADATA;
  
  const handleAddStandardTodos = () => {
    const existingTodos = selectedItemMeta.todos.map(t => t.text);
    const todosToAdd = standardTodos
        .filter(stdTodoText => !existingTodos.includes(stdTodoText))
        .map(stdTodoText => ({ id: Date.now() + Math.random(), text: stdTodoText, completed: false }));

    if (todosToAdd.length > 0) {
        const updatedTodos = [...selectedItemMeta.todos, ...todosToAdd];
        handleUpdateMetadata(selectedItemId, { todos: updatedTodos }, "Standard-Prozess gestartet.");
    }
  };

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (!newTodoText.trim() || !selectedItem) return;
    const newTodo = { id: Date.now(), text: newTodoText, completed: false };
    const updatedTodos = [...selectedItemMeta.todos, newTodo];
    handleUpdateMetadata(selectedItemId, { todos: updatedTodos }, `Todo hinzugefügt: "${newTodoText}"`);
    setNewTodoText('');
  };

  const handleToggleTodo = (todoId) => {
    let todoText = '';
    const updatedTodos = selectedItemMeta.todos.map(todo => {
      if (todo.id === todoId) {
        todoText = todo.text;
        return { ...todo, completed: !todo.completed };
      }
      return todo;
    });
    const activityText = `Todo "${todoText}" als ${updatedTodos.find(t=>t.id===todoId).completed ? 'erledigt' : 'offen'} markiert.`;
    handleUpdateMetadata(selectedItemId, { todos: updatedTodos }, activityText);
  };
  
  const handleDeleteTodo = (todoId) => {
    const updatedTodos = selectedItemMeta.todos.filter(todo => todo.id !== todoId);
    handleUpdateMetadata(selectedItemId, { todos: updatedTodos });
  };
  
  const handleForward = (recipient, message) => {
    const activityText = `An ${recipient.name} weitergeleitet mit Nachricht: "${message}"`;
    handleUpdateMetadata(selectedItemId, { activityLog: logActivity(selectedItemId, activityText) });
    setForwardModalOpen(false);
  };

  if (isLoading) return <div className={styles.loading}>Lade Angebots-Cockpit...</div>;

  return (
    <div className={styles.pageLayout}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}><h2>Vorgemerkte Verfahren ({likedItems.length})</h2></div>
        <div className={styles.itemList}>
          {likedItems.length > 0 ? likedItems.map(item => {
            const meta = metadata[item.id] || DEFAULT_METADATA;
            const status = STATUS_OPTIONS[meta.status] || STATUS_OPTIONS.in_prüfung; // Fallback for safety
            return (
              <div key={item.id} className={`${styles.itemCard} ${selectedItemId === item.id ? styles.active : ''}`} onClick={() => setSelectedItemId(item.id)}>
                <p className={styles.itemTitle}>{item.title}</p>
                <div className={styles.itemMeta}><span className={styles.statusTag} style={{'--status-color': status.color}}>{status.label}</span><span><Clock size={14} /> {item.endDate || 'Keine Frist'}</span></div>
              </div>
            );
          }) : <div className={styles.noItemsPlaceholder}><Info size={32} /><p>Keine vorgemerkten Ausschreibungen.</p></div>}
        </div>
      </div>
      {selectedItem ? (
        <div className={styles.mainContent}>
          <div className={styles.mainHeader}><h1>{selectedItem.title}</h1><div className={styles.headerActions}>{selectedItem.original_url && <a href={selectedItem.original_url} target="_blank" rel="noopener noreferrer" className={commonStyles.buttonSecondary}><ExternalLink size={16} /> Zur Quelle</a>}<button onClick={() => setForwardModalOpen(true)} className={commonStyles.buttonSecondary}><Send size={16} /> Weiterleiten</button><button onClick={() => handleUnlike(selectedItem.id)} className={styles.removeButton} title="Aus Cockpit entfernen"><Trash2 size={16} /></button></div></div>
          <div className={styles.contentGrid}>
            <div className={styles.leftColumn}>
                <div className={styles.card}><div className={styles.cardHeader}><Target size={18}/><h3>Status & Frist</h3></div><div className={styles.cardBody}><div className={styles.statusControl}><label>Aktueller Status</label><select value={selectedItemMeta.status} onChange={(e) => handleUpdateMetadata(selectedItemId, { status: e.target.value }, `Status geändert zu: ${STATUS_OPTIONS[e.target.value].label}`)}>{Object.entries(STATUS_OPTIONS).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}</select></div><div className={styles.deadlineInfo}><label>Abgabefrist</label><p>{selectedItem.endDate || "Keine Angabe"}</p></div></div></div>
                <div className={styles.card}><div className={styles.cardHeader}><Users size={18}/><h3>Verantwortung</h3></div><div className={styles.cardBody}><select value={selectedItemMeta.assignedTo || ''} onChange={(e) => handleUpdateMetadata(selectedItemId, { assignedTo: e.target.value }, `Zugewiesen an: ${team.find(u => u.id === e.target.value)?.name}`)}><option value="">Niemand zugewiesen</option>{team.map(user => <option key={user.id} value={user.id}>{user.name} ({user.role})</option>)}</select></div></div>
                <div className={styles.card}><div className={styles.cardHeader}><FileText size={18}/><h3>Notizen</h3></div><div className={styles.cardBody}><textarea className={styles.notesTextarea} placeholder="Allgemeine Notizen..." value={selectedItemMeta.notes} onChange={(e) => setMetadata(prev => ({ ...prev, [selectedItemId]: {...(prev[selectedItemId] || {}), notes: e.target.value} }))} onBlur={(e) => handleUpdateMetadata(selectedItemId, { notes: e.target.value }, "Notizen aktualisiert.")}/></div></div>
            </div>
            <div className={styles.rightColumn}>
              <div className={styles.card}><div className={styles.cardHeader}><CheckSquare size={18}/><h3>Aufgaben ({selectedItemMeta.todos.filter(t => !t.completed).length})</h3></div><div className={styles.cardBody}><button onClick={handleAddStandardTodos} className={styles.standardProcessButton}><PlayCircle size={16} /> Standard-Prozess starten</button><ul className={styles.todoList}>{selectedItemMeta.todos.map(todo => (<li key={todo.id} className={`${styles.todoItem} ${todo.completed ? styles.completed : ''}`}><button onClick={() => handleToggleTodo(todo.id)} className={styles.todoCheckbox}>{todo.completed ? <CheckSquare size={20} /> : <Square size={20} />}</button><span className={styles.todoText}>{todo.text}</span><button onClick={() => handleDeleteTodo(todo.id)} className={styles.todoDelete}><Trash2 size={16}/></button></li>))}</ul><form onSubmit={handleAddTodo} className={styles.addTodoForm}><input type="text" value={newTodoText} onChange={(e) => setNewTodoText(e.target.value)} placeholder="Neue Aufgabe..." /><button type="submit" className={commonStyles.buttonPrimary}><Plus size={18}/></button></form></div></div>
              <div className={styles.card}><div className={styles.cardHeader}><CornerUpLeft size={18}/><h3>Aktivitätsprotokoll</h3></div><div className={styles.activityLog}>{selectedItemMeta.activityLog.length > 0 ? selectedItemMeta.activityLog.map(log => (<div key={log.id} className={styles.logItem}><div className={styles.logText}><p><strong>{log.user}:</strong> {log.text}</p><time>{new Date(log.timestamp).toLocaleString('de-DE')}</time></div></div>)) : <p className={styles.noActivity}>Bisher keine Aktivitäten.</p>}</div></div>
            </div>
          </div>
        </div>
      ) : (<div className={styles.mainContentEmpty}><Info size={48} /><h2>Kein Verfahren ausgewählt</h2><p>Wählen Sie ein Verfahren aus der Liste.</p></div>)}
      {isForwardModalOpen && selectedItem && (<ForwardingModal item={selectedItem} team={team} onClose={() => setForwardModalOpen(false)} onForward={handleForward} />)}
    </div>
  );
};

export default CockpitPage;
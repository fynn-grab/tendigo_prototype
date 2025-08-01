// src/services/api.js
import axios from "axios";

const PROCUREMENTS_API_BASE_URL = "https://api.tendigo.eu";
const CHATBOT_API_BASE_URL = "https://api.tendigo.eu";
const DETAILS_API_BASE_URL = "https://api.tendigo.eu";

// --- Local Storage Keys ---
const LIKED_STORAGE_KEY = "likedProcurements";
const METADATA_STORAGE_KEY = "procurementMetadata";
const SAVED_SEARCHES_KEY = "savedSearches";
const TEAM_MEMBERS_KEY = "teamMembers";
const STANDARD_TODOS_KEY = "standardTodos";

// --- Default Data for Initialization ---
const DEFAULT_TEAM = [
  { id: 1, name: 'Dr. Elena Vogel', role: 'Geschäftsführung', email: 'vogel@firma.de' },
  { id: 2, name: 'Markus Weber', role: 'Leitung Vertrieb', email: 'weber@firma.de' },
  { id: 3, name: 'Sabine Schulze', role: 'Bid-Management', email: 'schulze@firma.de' },
];

const DEFAULT_STANDARD_TODOS = [
  "Go/No-Go Entscheidung treffen",
  "Anforderungsanalyse durchführen",
  "Rückfragen an Vergabestelle formulieren",
  "Angebot kalkulieren",
  "Rechtliche Prüfung (Justiziar)",
  "Angebot finalisieren und einreichen",
];

// Helper to get from storage or return default
const getFromStorage = (key, defaultValue) => {
  const storedValue = localStorage.getItem(key);
  if (storedValue) return JSON.parse(storedValue);
  localStorage.setItem(key, JSON.stringify(defaultValue));
  return defaultValue;
};

// --- Team Management API ---
export const getTeamMembers = async () => getFromStorage(TEAM_MEMBERS_KEY, DEFAULT_TEAM);

export const saveTeamMember = async (member) => {
  const members = await getTeamMembers();
  if (member.id) { // Update existing member
    const index = members.findIndex(m => m.id === member.id);
    if (index > -1) members[index] = member;
  } else { // Add new member
    member.id = Date.now();
    members.push(member);
  }
  localStorage.setItem(TEAM_MEMBERS_KEY, JSON.stringify(members));
  return member;
};

export const deleteTeamMember = async (memberId) => {
  let members = await getTeamMembers();
  members = members.filter(m => m.id !== memberId);
  localStorage.setItem(TEAM_MEMBERS_KEY, JSON.stringify(members));
  return { success: true };
};

// --- Standard Todos API ---
export const getStandardTodos = async () => getFromStorage(STANDARD_TODOS_KEY, DEFAULT_STANDARD_TODOS);

export const saveStandardTodos = async (todos) => {
  localStorage.setItem(STANDARD_TODOS_KEY, JSON.stringify(todos));
  return { success: true };
};

// --- Procurement Search & Details ---
export const fetchProcurements = async (requestBody) => {
  try {
    const response = await axios.post(`${PROCUREMENTS_API_BASE_URL}/data`, requestBody, { timeout: 60000 });
    return response.data;
  } catch (error) {
    console.error("Error fetching procurements:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const fetchDocumentDetails = async (filePath) => {
  try {
    const response = await axios.get(`${DETAILS_API_BASE_URL}/get-document-details`, { params: { path: filePath }, timeout: 60000 });
    return response.data;
  } catch (error) {
    console.error("Error fetching document details:", error.response ? error.response.data : error.message);
    throw error;
  }
};

// --- Chatbot ---
export const askChatbot = async (publicationNumber, question) => {
  try {
    const response = await axios.get(`${CHATBOT_API_BASE_URL}/ask-chatbot`, { params: { publication_number: publicationNumber, question: question } });
    return response.data;
  } catch (error) {
    return { error: error.response?.data?.error || "Network error or server unavailable" };
  }
};

// --- Liked Procurements & Metadata Logic ---
export const getLikedProcurements = async () => JSON.parse(localStorage.getItem(LIKED_STORAGE_KEY) || "[]");

export const likeProcurement = async (procurement) => {
  const liked = await getLikedProcurements();
  if (!liked.find((p) => p.id === procurement.id)) {
    liked.push(procurement);
    localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify(liked));
  }
  return { success: true };
};

export const unlikeProcurement = async (procurementId) => {
  let liked = await getLikedProcurements();
  liked = liked.filter((p) => p.id !== procurementId);
  localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify(liked));
  const allMeta = await getProcurementMetadata();
  delete allMeta[procurementId];
  localStorage.setItem(METADATA_STORAGE_KEY, JSON.stringify(allMeta));
  return { success: true };
};

export const getProcurementMetadata = async () => JSON.parse(localStorage.getItem(METADATA_STORAGE_KEY) || "{}");

export const updateProcurementMetadata = async (procurementId, newMeta) => {
  const allMeta = await getProcurementMetadata();
  const existingMeta = allMeta[procurementId] || { todos: [], activityLog: [], assignedTo: null, status: 'in_prüfung', notes: '' };
  allMeta[procurementId] = { ...existingMeta, ...newMeta };
  localStorage.setItem(METADATA_STORAGE_KEY, JSON.stringify(allMeta));
  return { success: true };
};

// --- Saved Searches Logic ---
export const getSavedSearches = async () => JSON.parse(localStorage.getItem(SAVED_SEARCHES_KEY) || "[]");

export const saveSearch = async (searchData) => {
  const searches = await getSavedSearches();
  searches.push(searchData);
  localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(searches));
  return { success: true };
};

export const deleteSavedSearch = async (searchId) => {
  let searches = await getSavedSearches();
  searches = searches.filter((s) => s.id !== searchId);
  localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(searches));
  return { success: true };
};

export const updateSavedSearch = async (searchId, updates) => {
  let searches = await getSavedSearches();
  const searchIndex = searches.findIndex((s) => s.id === searchId);
  if (searchIndex > -1) {
    searches[searchIndex] = { ...searches[searchIndex], ...updates };
    localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(searches));
  }
  return { success: true };
};

// --- Helper Functions ---
const formatDate = (dateString) => {
  if (!dateString) return null;
  // Handle formats like "2025-03-11+01:00" by just taking the date part.
  const date = new Date(dateString.substring(0, 10) + 'T00:00:00Z');
  if (isNaN(date.getTime())) {
    return "Ungültiges Datum";
  }
  return date.toLocaleDateString("de-DE");
};

export const mapApiProcurementToFrontend = (apiProc) => {
  if (!apiProc) return null;
  return {
    id: apiProc.notice_id,
    title: apiProc.procurement_project_name || "No title available",
    description: apiProc.procurement_project_description || apiProc.procurement_project_notes || "No description available.",
    authorityName: apiProc.authority_name,
    city: apiProc.authority_city,
    publicationDate: formatDate(apiProc.publication_date),
    startDate: formatDate(apiProc.submission_start_date),
    endDate: formatDate(apiProc.submission_end_date),
    original_url: apiProc.tender_document_url,
    _raw: apiProc,
  };
};
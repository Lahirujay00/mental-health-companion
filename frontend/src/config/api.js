// API Configuration
// Use environment variable if set, otherwise default to production backend
const DEFAULT_BACKEND_URL = 'https://mental-health-companion-backend-wheat.vercel.app/api';
const API_BASE_URL = process.env.REACT_APP_API_URL || DEFAULT_BACKEND_URL;

console.log('=== API CONFIGURATION DEBUG ===');
console.log('process.env.REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('API_BASE_URL:', API_BASE_URL);
console.log('Timestamp:', new Date().toISOString());
console.log('===============================');

// API endpoints - use resolved API_BASE_URL
export const API_ENDPOINTS = {
  // Auth
  auth: `${API_BASE_URL}/auth`,
  authProfile: `${API_BASE_URL}/auth/profile`,
  
  // Chat
  chat: `${API_BASE_URL}/chat`,
  chatHistory: `${API_BASE_URL}/chat/history`,
  
  // Goals
  goals: `${API_BASE_URL}/goals`,
  goalsAnalytics: `${API_BASE_URL}/goals/analytics`,
  goalsDailyProgress: `${API_BASE_URL}/goals/update-daily-progress`,
  goalsLog: (goalId) => `${API_BASE_URL}/goals/${goalId}/log`,
  goalsCheckin: (goalId) => `${API_BASE_URL}/goals/${goalId}/checkin`,
  goalsById: (goalId) => `${API_BASE_URL}/goals/${goalId}`,
  
  // Journal
  journal: `${API_BASE_URL}/journal`,
  journalStats: `${API_BASE_URL}/journal/stats/overview`,
  journalTest: `${API_BASE_URL}/journal/test`,
  journalById: (entryId) => `${API_BASE_URL}/journal/${entryId}`,
  
  // Emotions
  emotions: `${API_BASE_URL}/emotions`,
  emotionsById: (entryId) => `${API_BASE_URL}/emotions/${entryId}`,
  
  // Dashboard
  dashboardStats: `${API_BASE_URL}/dashboard/stats`,
  dashboardActivities: `${API_BASE_URL}/dashboard/activities`,
};

// Export API_BASE_URL as both named and default export
export { API_BASE_URL };
export default API_BASE_URL;

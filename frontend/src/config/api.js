// API Configuration
// Use environment variable if set, otherwise default to production backend
const DEFAULT_BACKEND_URL = 'https://mental-health-companion-backend-wheat.vercel.app';
const BACKEND_URL = process.env.REACT_APP_API_URL || DEFAULT_BACKEND_URL;
export const API_BASE_URL = `${BACKEND_URL}/api`;

console.log('=== API CONFIGURATION DEBUG ===');
console.log('process.env.REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('BACKEND_URL:', BACKEND_URL);
console.log('Final API_BASE_URL:', API_BASE_URL);
console.log('Timestamp:', new Date().toISOString());
console.log('===============================');

// API endpoints - use resolved BACKEND_URL
export const API_ENDPOINTS = {
  // Auth
  auth: `${BACKEND_URL}/api/auth`,
  authProfile: `${BACKEND_URL}/api/auth/profile`,
  
  // Chat
  chat: `${BACKEND_URL}/api/chat`,
  chatHistory: `${BACKEND_URL}/api/chat/history`,
  
  // Goals
  goals: `${BACKEND_URL}/api/goals`,
  goalsAnalytics: `${BACKEND_URL}/api/goals/analytics`,
  goalsDailyProgress: `${BACKEND_URL}/api/goals/update-daily-progress`,
  goalsLog: (goalId) => `${BACKEND_URL}/api/goals/${goalId}/log`,
  goalsCheckin: (goalId) => `${BACKEND_URL}/api/goals/${goalId}/checkin`,
  goalsById: (goalId) => `${BACKEND_URL}/api/goals/${goalId}`,
  
  // Journal
  journal: `${BACKEND_URL}/api/journal`,
  journalStats: `${BACKEND_URL}/api/journal/stats/overview`,
  journalTest: `${BACKEND_URL}/api/journal/test`,
  journalById: (entryId) => `${BACKEND_URL}/api/journal/${entryId}`,
  
  // Emotions
  emotions: `${BACKEND_URL}/api/emotions`,
  emotionsById: (entryId) => `${BACKEND_URL}/api/emotions/${entryId}`,
  
  // Dashboard
  dashboardStats: `${BACKEND_URL}/api/dashboard/stats`,
  dashboardActivities: `${BACKEND_URL}/api/dashboard/activities`,
};

export default API_BASE_URL;

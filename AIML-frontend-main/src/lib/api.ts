import axios from 'axios';

// Dynamically pick up the host IP so it works across local network devices without CORS PNA errors
const API_BASE = `${window.location.protocol}//${window.location.hostname}:8002`;

export const startAnalysis = async (data: any) => {
  const response = await axios.post(`${API_BASE}/api/analyze`, data);
  return response.data; // { session_id, status }
};

export const getStatus = async (sessionId: string) => {
  const response = await axios.get(`${API_BASE}/api/status/${sessionId}`);
  return response.data;
};

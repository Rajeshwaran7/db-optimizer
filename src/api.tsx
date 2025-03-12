import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export const fetchIssues = async () => {
  const response = await axios.get(`${API_URL}/detect_issues`);
  return response.data;
};

export const fetchPredictions = async () => {
  const response = await axios.get(`${API_URL}/predict_overflow`);
  return response.data;
};

export const applyFixes = async () => {
  const response = await axios.post(`${API_URL}/apply_fixes`);
  return response.data;
};

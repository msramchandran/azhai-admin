import axios from 'axios';

const api = axios.create({
  // Increased from 10s → 60s to handle large document/image payloads
  // (e.g. Base64-encoded driver documents: DL, RC, Aadhar images)
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      console.error('API Timeout: Request took too long to complete.', error.config?.url);
    } else {
      console.error('API Error:', error);
    }
    return Promise.reject(error);
  }
);

export default api;
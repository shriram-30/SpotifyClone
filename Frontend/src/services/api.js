import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Update with your backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getArtistById = async (id) => {
  try {
    const response = await api.get(`/artists/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching artist:', error);
    throw error;
  }
};

export const getArtistTopTracks = async (id) => {
  try {
    const response = await api.get(`/artists/${id}/tracks`);
    return response.data;
  } catch (error) {
    console.error('Error fetching artist tracks:', error);
    throw error;
  }
};

export default api;

import axios from 'axios';

const API_URL = 'http://localhost:5000/api/artists';

export const getArtists = async () => {
  try {
    console.log('Fetching artists from:', API_URL);
    const response = await axios.get(API_URL, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    console.log('Artists response:', response);
    return response.data.artists || [];
  } catch (error) {
    console.error('Error fetching artists:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });
    throw error; // Re-throw to handle in the component
  }
};

export const getArtistSongs = async (artistName) => {
  try {
    const response = await axios.get(`${API_URL}/${encodeURIComponent(artistName)}/songs`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching artist songs:', error);
    return [];
  }
};

import coolieimg from "../assets/images/coolie.png";
import img2 from "../assets/images/img2.png"
import img3 from "../assets/images/img3.png"
import img4 from "../assets/images/img4.png"
import img5 from "../assets/images/img5.png"
import artist1 from "../assets/images/artist1.png"
import artist2 from "../assets/images/artist2.png"
import artist3 from "../assets/images/artist3.png"
import artiist4 from "../assets/images/artist4.png"
import artist5 from "../assets/images/artist5.png"
import Audio from "../assets/Audios/audio1.mp3"

// Exported array that will be populated from backend (no placeholders)
export const TrendingCardDetails = []

export const ArtistDetails=[
{img:artist1,
  name:"Pritam",
  },
{img:artist2,
  name:"ArjithSingh",
  },
{img:artist3,
  name:"A.R. Rahman",
},
{img:artiist4,
  name:"Sachin-Jigar",
 },
{img:artist5,
  name:"Vishal-shekar",
  }
]

// Using default backend URL
const API_BASE = 'https://spotifyclone-1-58hp.onrender.com';

/**
 * Fetch trending cards from backend
 * Returns: Array<{ imgsrc: string, heading: string, subheading: string, music?: string }>
 */
export async function fetchTrending() {
  try {
    const res = await fetch(`${API_BASE}/api/music/trending-songs`);
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }
    const json = await res.json();
    console.log('Fetched trending songs:', json);
    return json.data || [];
  } catch (e) {
    console.error('Failed to fetch trending from backend:', e);
    return [];
  }
}

/**
 * Fetch artist list from backend
 * Returns: Array<{ img: string, name: string }>
 */
export async function fetchArtists() {
  try {
    const res = await fetch(`${API_BASE}/api/music/artists`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (e) {
    console.error('Failed to fetch artists from backend, falling back to static data:', e);
    return ArtistDetails;
  }
}

/**
 * Fetch a track by its MongoDB ID
 * Returns: { _id, imgsrc, heading, subheading, music } | null
 */
export async function fetchTrackById(id) {
  try {
    if (!id) return null;
    console.log(`[fetchTrackById] Fetching track with ID: ${id}`);
    const res = await fetch(`${API_BASE}/api/music/tracks/${id}`);
    if (!res.ok) {
      console.error(`[fetchTrackById] HTTP error: ${res.status}`, await res.text());
      throw new Error(`HTTP ${res.status}`);
    }
    const json = await res.json();
    console.log('[fetchTrackById] Response:', json);
    
    const track = json.data;
    if (track) {
      // Ensure the music URL is properly formatted
      if (track.music && !track.music.startsWith('http') && !track.music.startsWith('blob:')) {
        // If it's a relative path, prepend the API base URL
        track.music = `${API_BASE}${track.music.startsWith('/') ? '' : '/'}${track.music}`;
      }
      console.log('[fetchTrackById] Returning track:', track);
      return track;
    }
    console.warn('[fetchTrackById] No track found with ID:', id);
    return null;
  } catch (e) {
    console.error('Failed to fetch track by ID:', e);
    return null;
  }
}

/**
 * Fetch a track by its song name (heading)
 * Returns: { _id, imgsrc, heading, subheading, music } | null
 */
export async function fetchTrackByName(name) {
  try {
    if (!name) return null;
    console.log(`[fetchTrackByName] Fetching track: ${name}`);
    const res = await fetch(`${API_BASE}/api/music/tracks?name=${encodeURIComponent(name)}`);
    if (!res.ok) {
      console.error(`[fetchTrackByName] HTTP error: ${res.status}`, await res.text());
      throw new Error(`HTTP ${res.status}`);
    }
    const json = await res.json();
    console.log('[fetchTrackByName] Response:', json);
    
    if (Array.isArray(json.data) && json.data.length) {
      const track = json.data[0];
      // Ensure the music URL is properly formatted
      if (track.music && !track.music.startsWith('http') && !track.music.startsWith('blob:')) {
        // If it's a relative path, prepend the API base URL
        track.music = `${API_BASE}${track.music.startsWith('/') ? '' : '/'}${track.music}`;
      }
      console.log('[fetchTrackByName] Returning track:', track);
      return track;
    }
    console.warn('[fetchTrackByName] No tracks found for:', name);
    return null;
  } catch (e) {
    console.error('Failed to fetch track by name:', e);
    return null;
  }
}

// Immediately populate TrendingCardDetails from backend on module load.
// This keeps the component API unchanged (it still imports TrendingCardDetails),
// while ensuring data originates from the DB when available.
;(async function populateTrendingCardDetails() {
  try {
    const data = await fetchTrending();
    if (Array.isArray(data)) {
      // Normalize to match existing shape and keep backward compatibility with 'Music'
      const normalized = data.map(item => ({
        imgsrc: item.imgsrc,
        heading: item.heading,
        subheading: item.subheading,
        Music: item.music || item.Music || '',
      }));
      // Replace contents in-place to preserve reference
      TrendingCardDetails.length = 0;
      TrendingCardDetails.push(...normalized);
    }
  } catch (e) {
    // Leave as empty array on failure
  }
})();
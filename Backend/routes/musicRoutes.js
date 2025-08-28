import { Router } from 'express';
import mongoose from 'mongoose';
import TrendingSong from '../models/Trendingsong.js';

const router = Router();

// Get all trending songs
router.get('/trending-songs', async (req, res) => {
    console.log('Fetching trending songs...');
    try {
        const songs = await TrendingSong.find({}).limit(50);
        console.log(`Found ${songs.length} trending songs`);
        res.status(200).json({
            success: true,
            count: songs.length,
            data: songs
        });
    } catch (error) {
        console.error('Error fetching trending songs:', error);
        res.status(500).json({ 
            success: false,
            status: 'error', 
            message: 'Failed to fetch trending songs',
            error: error.message 
        });
    }
});

// Test endpoint to verify database connection and data
router.get('/test-db', async (req, res) => {
  try {
    // Check if connected to MongoDB
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'not connected';
    
    // Get collection names
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Check if our collection exists
    const hasTracksCollection = collectionNames.includes('tracks');
    
    // Get count of documents in tracks collection
    let tracksCount = 0;
    let sampleTrack = null;
    
    if (hasTracksCollection) {
      tracksCount = await TrendingSong.countDocuments();
      sampleTrack = await TrendingSong.findOne().lean();
    }
    
    res.json({
      status: 'success',
      db: {
        status: dbStatus,
        collections: collectionNames,
        tracks: {
          exists: hasTracksCollection,
          count: tracksCount,
          sample: sampleTrack
        }
      }
    });
  } catch (error) {
    console.error('Test DB error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to test database connection',
      error: error.message
    });
  }
});

// Test endpoint to check environment
router.get('/test', (req, res) => {
  res.json({
    status: 'API is working',
    timestamp: new Date().toISOString()
  });
});

// GET /api/music/tracks?name=<song name> - fetch by songName (case-insensitive)
router.get('/tracks', async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ error: 'name query is required' });

    console.log(`[GET /api/music/tracks] Searching for song: ${name}`);
    
    // Find matching tracks by songName (case-insensitive exact match)
    const tracks = await TrendingSong.find({
      songName: { $regex: new RegExp(`^${name}$`, 'i') },
    }).lean();

    console.log(`[GET /api/music/tracks] Found ${tracks.length} tracks for query: ${name}`);
    
    if (tracks.length > 0) {
      // Log the first track for debugging
      console.log('[GET /api/music/tracks] First track data:', {
        _id: tracks[0]._id,
        songName: tracks[0].songName,
        heading: tracks[0].heading,
        music: tracks[0].music,
        hasMusic: !!tracks[0].music
      });
    }

    res.json({ 
      success: true,
      count: tracks.length,
      data: tracks 
    });
  } catch (e) {
    console.error('[GET /api/music/tracks] Error:', e);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch track by name',
      details: e.message 
    });
  }
});

// GET /api/music/tracks/:id - fetch a single track by ID
router.get('/tracks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid track ID format' 
      });
    }

    console.log(`[GET /api/music/tracks/${id}] Fetching track`);
    
    const track = await TrendingSong.findById(id).lean();
    
    if (!track) {
      console.log(`[GET /api/music/tracks/${id}] Track not found`);
      return res.status(404).json({ 
        success: false, 
        error: 'Track not found' 
      });
    }

    console.log(`[GET /api/music/tracks/${id}] Found track:`, {
      _id: track._id,
      songName: track.songName || 'N/A',
      heading: track.heading || 'N/A'
    });

    res.json({ 
      success: true,
      data: track 
    });
  } catch (e) {
    console.error(`[GET /api/music/tracks/:id] Error:`, e);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch track',
      details: e.message 
    });
  }
});



export default router;
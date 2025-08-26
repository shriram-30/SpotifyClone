import { Router } from 'express';
import mongoose from 'mongoose';
import TrendingSong from '../models/Trendingsong.js';

const router = Router();

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

// GET /api/music/trending - fetch all tracks from DB
router.get('/trending', async (_req, res) => {
  try {
    const data = await TrendingSong.find({}).lean();
    console.log(`[GET /api/music/trending] -> ${data.length} items`);
    res.json({ data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch tracks' });
  }
});

// GET /api/music/tracks?name=<song name> - fetch by heading (case-insensitive)
router.get('/tracks', async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ error: 'name query is required' });

    console.log(`[GET /api/music/tracks] Searching for: ${name}`);
    
    // Find matching tracks (case-insensitive exact match)
    const tracks = await TrendingSong.find({
      heading: { $regex: new RegExp(`^${name}$`, 'i') },
    }).lean();

    console.log(`[GET /api/music/tracks] Found ${tracks.length} tracks for query: ${name}`);
    
    if (tracks.length > 0) {
      // Log the first track for debugging
      console.log('[GET /api/music/tracks] First track data:', {
        _id: tracks[0]._id,
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

export default router;
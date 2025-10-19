import express from 'express';
import Artist from '../models/Artist.js';
import Album from '../models/Album.js';
import TrendingSong from '../models/Trendingsong.js';
import mongoose from 'mongoose';

const router = express.Router();

// Helper function to escape regex special characters
const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

// @route   GET /api/artists
// @desc    Get all artists with pagination and search
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const searchQuery = req.query.search || '';

    // Create search regex
    const searchRegex = new RegExp(escapeRegex(searchQuery), 'i');
    
    // Build query
    const query = searchQuery 
      ? { name: { $regex: searchRegex } } 
      : {};

    // Get total count for pagination
    const total = await Artist.countDocuments(query);
    
    // Get paginated artists
    const artists = await Artist.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: artists.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      artists
    });
  } catch (err) {
    console.error('Error fetching artists:', err);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching artists.'
    });
  }
});

// @route   GET /api/artists/:id
// @desc    Get artist by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid artist ID' 
      });
    }

    const artist = await Artist.findById(req.params.id);
    if (!artist) {
      return res.status(404).json({ 
        success: false,
        message: 'Artist not found' 
      });
    }

    res.status(200).json({
      success: true,
      artist
    });
  } catch (err) {
    console.error('Error fetching artist:', err);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching artist.'
    });
  }
});

// @route   GET /api/artists/name/:name
// @desc    Get artist by name (case-insensitive)
// @access  Public
router.get('/name/:name', async (req, res) => {
  try {
    const artistName = req.params.name;
    const artist = await Artist.findOne({ 
      name: { $regex: new RegExp(`^${escapeRegex(artistName)}$`, 'i') } 
    });

    if (!artist) {
      return res.status(404).json({ 
        success: false,
        message: 'Artist not found' 
      });
    }

    res.status(200).json({
      success: true,
      artist
    });
  } catch (err) {
    console.error('Error fetching artist by name:', err);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching artist.'
    });
  }
});

// @route   GET /api/artists/:name/songs
// @desc    Get all songs where either the album artist or any song artist matches the artist name (case-insensitive)
// @access  Public
router.get('/:name/songs', async (req, res) => {
  try {
    const artistName = req.params.name;
    const artistRegex = new RegExp(escapeRegex(artistName), 'i');

    // Find all songs where either:
    // 1. The album's artist matches the artist name, OR
    // 2. Any of the song's artists match the artist name
    const albumSongs = await Album.aggregate([
      { $unwind: "$songs" },
      { 
        $match: {
          $or: [
            { 'songs.artists': artistRegex }, // Song artists match
            { 'artist': artistRegex } // Album artist matches
          ]
        } 
      },
      { 
        $project: { 
          _id: "$songs._id",
          title: "$songs.title",
          artists: "$songs.artists",
          duration: "$songs.duration",
          url: "$songs.url",
          canvasUrl: "$songs.canvasUrl",
          album: {
            _id: "$_id",
            name: "$name",
            imageUrl: "$imageUrl",
            artist: "$artist"
          },
          type: 'album'
        }
      }
    ]);

    // For trending songs, just check if any artist matches
    const trendingSongs = await TrendingSong.aggregate([
      {
        $match: {
          $or: [
            { artists: artistRegex },
            { albumArtist: artistRegex }
          ]
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          artists: 1,
          duration: 1,
          url: 1,
          album: {
            name: "$albumName",
            imageUrl: "$imageUrl",
            artist: "$albumArtist"
          },
          type: 'trending'
        }
      }
    ]);

    // Combine and format the results
    const allSongs = [
      ...albumSongs,
      ...trendingSongs.map(song => ({
        ...song,
        album: {
          name: song.albumName,
          imageUrl: song.imageUrl
        },
        type: 'trending'
      }))
    ];

    res.status(200).json({
      success: true,
      count: allSongs.length,
      songs: allSongs
    });
  } catch (err) {
    console.error('Error fetching artist songs:', err);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching artist songs.'
    });
  }
});

// @route   POST /api/artists
// @desc    Create a new artist
// @access  Private/Admin
router.post('/', async (req, res) => {
  try {
    const { name, img, bio, genres, sociallinks, coverimg } = req.body;

    // Check if artist already exists
    const existingArtist = await Artist.findOne({ 
      name: { $regex: new RegExp(`^${escapeRegex(name)}$`, 'i') } 
    });

    if (existingArtist) {
      return res.status(400).json({
        success: false,
        message: 'Artist with this name already exists'
      });
    }

    // Create new artist
    const newArtist = new Artist({
      name,
      img,
      bio,
      genres,
      sociallinks: sociallinks || {},
      coverimg,
      createdAt: new Date().toISOString().split('T')[0] // Format: YYYY-MM-DD
    });

    const savedArtist = await newArtist.save();

    res.status(201).json({
      success: true,
      artist: savedArtist
    });
  } catch (err) {
    console.error('Error creating artist:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to create artist',
      details: err.message
    });
  }
});

// @route   PUT /api/artists/:id
// @desc    Update an artist
// @access  Private/Admin
router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid artist ID' 
      });
    }

    const updates = { ...req.body };
    delete updates._id; // Prevent ID change

    const updatedArtist = await Artist.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedArtist) {
      return res.status(404).json({ 
        success: false,
        message: 'Artist not found' 
      });
    }

    res.status(200).json({
      success: true,
      artist: updatedArtist
    });
  } catch (err) {
    console.error('Error updating artist:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update artist',
      details: err.message
    });
  }
});

// @route   DELETE /api/artists/:id
// @desc    Delete an artist
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid artist ID' 
      });
    }

    const deletedArtist = await Artist.findByIdAndDelete(req.params.id);

    if (!deletedArtist) {
      return res.status(404).json({ 
        success: false,
        message: 'Artist not found' 
      });
    }

    // TODO: Consider cleaning up related data (songs, albums, etc.)

    res.status(200).json({
      success: true,
      message: 'Artist deleted successfully',
      artist: deletedArtist
    });
  } catch (err) {
    console.error('Error deleting artist:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete artist',
      details: err.message
    });
  }
});

export default router;

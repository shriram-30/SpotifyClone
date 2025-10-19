import { Router } from 'express';
import Album from '../models/Album.js';

const router = Router();

// @route   GET /api/music/albums
// @desc    Get all albums
// @access  Public
router.get('/', async (req, res) => {
    try {
        const albums = await Album.find({}).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: albums.length,
            data: albums
        });
    } catch (error) {
        console.error('Error fetching albums:', error);
        res.status(500).json({ 
            success: false,
            status: 'error', 
            message: 'Failed to fetch albums',
            error: error.message 
        });
    }
});

// @route   GET /api/music/albums/:id
// @desc    Get single album by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const album = await Album.findById(req.params.id).populate('songs');
        
        if (!album) {
            return res.status(404).json({
                success: false,
                message: 'Album not found'
            });
        }
        
        // Format the response to match the frontend expectations
        const formattedAlbum = {
            ...album.toObject(),
            songs: album.songs.map(song => ({
                ...song,
                _id: song._id || Math.random().toString(36).substr(2, 9), // Generate a temporary ID if not present
                title: song.title || 'Unknown Track',
                artists: song.artists || album.artist,
                duration: song.duration || '0:00',
                url: song.url || '#',
                canvasUrl: song.canvasUrl
            }))
        };
        
        res.status(200).json({
            success: true,
            data: formattedAlbum
        });
    } catch (error) {
        console.error('Error fetching album:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: 'Invalid album ID'
            });
        }
        res.status(500).json({ 
            success: false,
            status: 'error', 
            message: 'Failed to fetch album',
            error: error.message 
        });
    }
});

// @route   POST /api/music/albums
// @desc    Create a new album
// @access  Private (add authentication middleware later)
router.post('/', async (req, res) => {
    try {
        const newAlbum = new Album(req.body);
        const savedAlbum = await newAlbum.save();
        
        res.status(201).json({
            success: true,
            data: savedAlbum
        });
    } catch (error) {
        console.error('Error creating album:', error);
        res.status(500).json({ 
            success: false,
            status: 'error', 
            message: 'Failed to create album',
            error: error.message 
        });
    }
});

export default router;

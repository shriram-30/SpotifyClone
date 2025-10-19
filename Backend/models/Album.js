import mongoose from 'mongoose';

const albumSchema = new mongoose.Schema({
  albumname: {
    type: String,
    required: true
  },
  artist: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  songs: [{
    title: {
      type: String,
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    artists: {
      type: String,
      required: true
    },
    canvasUrl:{
      type: String,
      required: true
    }
  }],
  Download: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Album || mongoose.model('Album', albumSchema);

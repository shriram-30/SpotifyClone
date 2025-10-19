import mongoose from 'mongoose'

const ArtistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  img: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    required: true
  },
  genres: {
    type: String, // You can change to [String] if storing as array
    required: true
  },
  sociallinks: {
    instagram: {
      type: String,
      default: ''
    },
    youtube: {
      type: String,
      default: ''
    }
  },
  createdAt: {
    type: String, // If you're storing manually formatted dates like "5-10-2025"
    required: true
  },
  coverimg: {
    type: String,
    required: true
  }
});

export default mongoose.model('Artist', ArtistSchema);

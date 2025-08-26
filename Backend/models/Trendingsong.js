import mongoose from "mongoose";

const trendingSongSchema = new mongoose.Schema(
  {
    imgsrc: { type: String, required: true },
    heading: { type: String, required: true, index: true },
    subheading: { type: String, required: true },
    music: { type: String, required: true },
  },
  { timestamps: true, collection: 'tracks' } // use 'tracks' collection
);

const TrendingSong = mongoose.model('TrendingSong', trendingSongSchema);
export default TrendingSong;
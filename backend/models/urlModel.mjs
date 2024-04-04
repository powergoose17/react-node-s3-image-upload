import mongoose from 'mongoose';
const urlSchema = new mongoose.Schema({
  photoUrl: String,
});

const Urls = mongoose.model("Urls", urlSchema);
export default Urls;
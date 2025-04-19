
import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  ciphertext: String,
  receipt: String
});
export default mongoose.model('Vote', schema);

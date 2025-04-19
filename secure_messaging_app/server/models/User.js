
import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  hash: String
});
export default mongoose.model('User', userSchema);

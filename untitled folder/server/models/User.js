import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  hash: String,
  verified: { type: Boolean, default: false },
  otp: String,                      // ✅ รหัส OTP
  otpExpires: Number                // ✅ เวลาหมดอายุ (timestamp millisec)
});

export default mongoose.model('User', schema);
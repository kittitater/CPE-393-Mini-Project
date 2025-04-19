
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import nodemailer from 'nodemailer';

const router = express.Router();
const transport = nodemailer.createTransport({ sendmail: true });

router.post('/register', async (req,res)=>{
  const { username, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, hash, verified:false });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpires = Date.now() + 5 * 60 * 1000; // ✅ หมดอายุใน 5 นาที
  await user.save();

  console.log('OTP for', email, ':', otp);

  await transport.sendMail({
    from:'noreply@evote',
    to: email,
    subject: 'OTP',
    text: `Your OTP is: ${otp}`
  });

  res.json({ ok:true, id:user._id, otp });
});


router.post('/verify', async (req,res)=>{
  const { username, otp } = req.body;
  const user = await User.findOne({ username });

  if (!user || user.otp !== otp) {
    return res.status(400).json({ error:'Invalid OTP' });
  }

  // ✅ เช็กว่า OTP หมดอายุหรือยัง
  if (!user.otpExpires || user.otpExpires < Date.now()) {
    return res.status(400).json({ error:'OTP expired' });
  }

  user.verified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  res.json({ ok:true });
});


router.post('/login', async (req,res)=>{
  const { username, password } = req.body;
  const user = await User.findOne({ username, verified:true });
  if (!user) return res.status(400).json({ error:'Not verified' });
  if (!(await bcrypt.compare(password, user.hash))) return res.status(401).json({ error:'Bad credentials' });
  const token = jwt.sign({ sub:user._id }, process.env.JWT_SECRET, { expiresIn:'15m' });
  res.json({ token, user:{ id:user._id, username } });
});

export default router;

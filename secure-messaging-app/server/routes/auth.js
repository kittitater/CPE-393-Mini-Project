
import express from 'express';
import User from '../models/User.js';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const hash = await argon2.hash(password, { type: argon2.argon2id });
  const user = await User.create({ username, hash });
  res.json({ ok: true, id: user._id });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await argon2.verify(user.hash, password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, { expiresIn: '5m' });
  res.json({ token, user: { id: user._id, username } });
});

export default router;

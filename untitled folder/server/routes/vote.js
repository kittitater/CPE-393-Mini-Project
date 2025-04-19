
import express from 'express';
import jwt from 'jsonwebtoken';
import Vote from '../models/Vote.js';
import User from '../models/User.js';
import { PublicKey, PrivateKey } from 'paillier-bigint';
import fs from 'fs';
import path from 'path';
import { createHash } from 'node:crypto';


const router = express.Router();

const pubJson = JSON.parse(fs.readFileSync(path.resolve('keys/public.json')));
const privJson = JSON.parse(fs.readFileSync(path.resolve('keys/private.json')));
const publicKey = new PublicKey(BigInt(pubJson.n), BigInt(pubJson.g));
const privateKey = new PrivateKey(
    BigInt(privJson.lambda),
    BigInt(privJson.mu),
    publicKey,
    BigInt(privJson.p),
    BigInt(privJson.q)
);

function auth(req,res,next){
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error:'Missing token' });
  try{
    const payload = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    req.userId = payload.sub; next();
  }catch{ return res.status(401).json({ error:'Invalid token' }); }
}

router.post('/cast', auth, async (req, res) => {
  try {
    const { vote } = req.body;
    console.log('🗳️ vote:', vote, '| typeof:', typeof vote);

    const user = await User.findById(req.userId);
    if (!user) return res.status(400).json({ error: 'No user' });

    const already = await Vote.findOne({ user: user._id });
    if (already) return res.status(400).json({ error: 'Already voted' });

    const bigVote = BigInt(vote);
    const cipher = publicKey.encrypt(bigVote);
    const cipherHex = cipher.toString(16);

    const receipt = createHash('sha256').update(cipher.toString()).digest('hex'); // ✅ อยู่ในนี้

    await Vote.create({
      user: user._id,
      ciphertext: cipherHex,
      receipt
    });

    console.log('✅ Vote stored with receipt:', receipt);
    res.json({ ok: true, receipt });

  } catch (err) {
    console.error('❌ Internal vote error:', err);
    res.status(500).json({ error: 'Vote failed internally' });
  }
});



router.get('/verify/:receipt', async (req,res)=>{
  const vote = await Vote.findOne({ receipt:req.params.receipt });
  res.json({ counted: !!vote });
});

router.get('/tally', async (req,res)=>{
  const votes = await Vote.find();
  let aggregate = publicKey.encrypt(0n);
  votes.forEach(v=>{
    aggregate = publicKey.addition(aggregate, BigInt('0x'+v.ciphertext));
  });
  const total = privateKey.decrypt(aggregate);
  res.json({ total: total.toString() });
});

export default router;

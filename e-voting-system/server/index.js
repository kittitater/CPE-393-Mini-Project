import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import mongoose from 'mongoose';
import 'dotenv/config'; // ✅ make sure .env is loaded

import authRoutes from './routes/auth.js';
import voteRoutes from './routes/vote.js';

const app = express();

app.options('*', cors()); // ✅ Allow preflight
// ✅ Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(rateLimit({ windowMs: 60 * 1000, max: 100 }));
app.use(mongoSanitize());
app.use(hpp());
app.use(express.json());

// ✅ Attach Paillier public key to app.locals
const pubJson = JSON.parse(fs.readFileSync(path.resolve('keys/public.json')));
app.locals.publicKey = pubJson;

// ✅ Connect MongoDB then start server
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB connected');

  // ✅ Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/vote', voteRoutes);

  const port = process.env.PORT || 3002;
  app.listen(port, () => console.log('✅ Evoting server listening on port', port));

}).catch(err => {
  console.error('❌ MongoDB connection failed:', err.message);
});

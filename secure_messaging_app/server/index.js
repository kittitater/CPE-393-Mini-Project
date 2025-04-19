
import express from 'express';
import https from 'https';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import authRoutes from './routes/auth.js';

const app = express();

app.set('trust proxy', 1);
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(rateLimit({ windowMs: 60 * 1000, max: 100 }));
app.use(mongoSanitize());
app.use(hpp());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI);

app.use('/api/auth', authRoutes);

const port = process.env.PORT || 3001;

let server;
if (process.env.NODE_ENV === 'production') {
  const credentials = {
    key: fs.readFileSync(process.env.TLS_KEY_PATH),
    cert: fs.readFileSync(process.env.TLS_CERT_PATH)
  };
  server = https.createServer(credentials, app).listen(port, () => console.log('HTTPS server on', port));
} else {
  server = app.listen(port, () => console.log('HTTP dev server on', port));
}

const io = new Server(server, {
  cors: { origin: process.env.CORS_ORIGIN }
});

io.use((socket, next) => {
  try {
    const payload = jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
    socket.user = payload.sub;
    next();
  } catch {
    next(new Error('Unauthorized'));
  }
});

io.on('connection', socket => {
  socket.on('message', ({ to, ciphertext }) => {
    io.to(to).emit('message', { from: socket.user, ciphertext });
  });
});

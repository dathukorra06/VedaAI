import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import connectDB from './config/db';
import assignmentRoutes from './routes/assignment.routes';
import groupRoutes from './routes/group.routes';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Allow requests for development and your production domain
const corsOrigin = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  if (process.env.NODE_ENV !== 'production' || !origin || origin.startsWith('https://')) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
};

// Setup Socket.IO for real-time updates
export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Root route to verify backend is running, useful for Vercel deployment confirmation
app.get('/', (req, res) => {
  res.send('Backend running successfully');
});

app.use('/api/assignments', assignmentRoutes);
app.use('/api/groups', groupRoutes);

// Database Connection
connectDB();

// Initialize BullMQ Worker (optional based on Redis)
if (process.env.NODE_ENV !== 'production') {
  import('./queue/worker');
}

const PORT = Number(process.env.PORT) || 5000;
if (process.env.NODE_ENV !== 'production') {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;

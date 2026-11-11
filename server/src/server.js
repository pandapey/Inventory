import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { setIO } from './sockets/inventorySocket.js';

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CLIENT_URL?.split(',') || '*', methods: ['GET','POST','PATCH'] } });
setIO(io);
io.on('connection', (socket) => {
  console.log('socket connected', socket.id);
  socket.on('disconnect', () => console.log('socket disconnected', socket.id));
});

await connectDB();
server.listen(PORT, () => console.log(`API running on :${PORT}`));

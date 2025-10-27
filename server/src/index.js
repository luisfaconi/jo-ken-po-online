import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { LobbyManager } from './game/lobbyManager.js';

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '*';

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST']
  }
});

const lobby = new LobbyManager(io);

io.on('connection', (socket) => {
  lobby.registerSocket(socket);
});

httpServer.listen(PORT, () => {
  console.log(`Servidor Jo-Ken-Po ouvindo na porta ${PORT}`);
});

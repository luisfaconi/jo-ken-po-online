import { GameRoom } from './gameRoom.js';

export class LobbyManager {
  constructor(io) {
    this.io = io;
    this.queue = [];
    this.rooms = new Map(); // roomId -> GameRoom
    this.playerRoom = new Map(); // socketId -> roomId
  }

  registerSocket(socket) {
    socket.emit('welcome', { playerId: socket.id });
    socket.emit('roomsOnline', { rooms: this.rooms.size });

    socket.on('joinQueue', () => this.enqueue(socket));
    socket.on('cancelQueue', () => this.dequeue(socket));
    socket.on('submitChoice', ({ choice }) => this.handleChoice(socket, choice));
    socket.on('disconnect', () => this.handleDisconnect(socket));
  }

  enqueue(socket) {
    if (this.queue.includes(socket)) {
      return;
    }

    if (this.playerRoom.has(socket.id)) {
      socket.emit('matchAlreadyRunning');
      return;
    }

    this.queue.push(socket);
    socket.emit('queueJoined');
    this.broadcastQueueSize();
    this.broadcastRoomsOnline();
    this.matchPlayers();
  }

  dequeue(socket) {
    const index = this.queue.indexOf(socket);
    if (index >= 0) {
      this.queue.splice(index, 1);
      socket.emit('queueLeft');
      this.broadcastQueueSize();
      this.broadcastRoomsOnline();
    }
  }

  handleChoice(socket, choice) {
    const room = this.getRoomForPlayer(socket.id);
    if (!room) {
      socket.emit('errorMessage', { message: 'Voc\u00ea n\u00e3o est\u00e1 em uma partida ativa.' });
      return;
    }

    room.submitChoice(socket.id, choice);
  }

  handleDisconnect(socket) {
    this.dequeue(socket);

    const room = this.getRoomForPlayer(socket.id);
    if (!room) {
      return;
    }

    room.removePlayer(socket.id);
    this.playerRoom.delete(socket.id);

    const remainingPlayers = room.listPlayers();
    for (const remainingId of remainingPlayers) {
      this.playerRoom.delete(remainingId);
    }

    room.destroy();
    this.cleanupRoom(room);
  }

  matchPlayers() {
    while (this.queue.length >= 2) {
      const playerA = this.queue.shift();
      const playerB = this.queue.shift();

      if (!playerA?.connected) {
        continue;
      }

      if (!playerB?.connected) {
        this.queue.unshift(playerA);
        continue;
      }

      this.createRoom(playerA, playerB);
    }
  }

  createRoom(playerA, playerB) {
    const room = new GameRoom({
      io: this.io,
      onFinish: (summary) => this.handleMatchFinished(room, summary)
    });
    this.rooms.set(room.id, room);

    room.addPlayer(playerA);
    room.addPlayer(playerB);

    this.playerRoom.set(playerA.id, room.id);
    this.playerRoom.set(playerB.id, room.id);
    this.broadcastQueueSize();
    this.broadcastRoomsOnline();

    const basePayload = (self, opponent) => ({
      roomId: room.id,
      round: room.round,
      opponent: {
        id: opponent.id
      }
    });

    playerA.emit('matchStarted', basePayload(playerA, playerB));
    playerB.emit('matchStarted', basePayload(playerB, playerA));
  }

  getRoomForPlayer(socketId) {
    const roomId = this.playerRoom.get(socketId);
    if (!roomId) {
      return null;
    }
    return this.rooms.get(roomId) ?? null;
  }

  cleanupRoom(room) {
    if (!room) {
      return;
    }

    this.rooms.delete(room.id);
    this.broadcastRoomsOnline();
  }

  broadcastQueueSize() {
    this.io.emit('queueSize', { size: this.queue.length });
  }

  broadcastRoomsOnline() {
    this.io.emit('roomsOnline', { rooms: this.rooms.size });
  }

  handleMatchFinished(room, summary) {
    if (!room) {
      return;
    }

    const playerIds = [...room.listPlayers()];
    playerIds.forEach((id) => this.playerRoom.delete(id));

    room.destroy();
    this.cleanupRoom(room);
    this.broadcastQueueSize();
    this.broadcastRoomsOnline();

    if (!summary?.playerIds) {
      return;
    }

    summary.playerIds.forEach((id) => {
      this.playerRoom.delete(id);
    });
  }
}

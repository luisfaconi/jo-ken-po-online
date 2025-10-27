import { v4 as uuid } from 'uuid';
import { determineRoundOutcome, isValidChoice } from './result.js';
import { POINTS_TO_WIN, ROUND_RESET_DELAY_MS, CHOICE_TIMEOUT_MS } from './constants.js';

export class GameRoom {
  constructor({ io, id = uuid(), onFinish = null }) {
    this.io = io;
    this.id = id;
    this.players = new Map(); // socketId -> { socket, choice, score }
    this.round = 1;
    this.finished = false;
    this.onFinish = onFinish;
    this.roundTimeout = null;
  }

  addPlayer(socket) {
    if (this.players.size >= 2 || this.finished) {
      throw new Error('Room is already full');
    }

    this.players.set(socket.id, {
      socket,
      choice: null,
      score: 0
    });

    socket.join(this.id);
    socket.emit('joinedRoom', { roomId: this.id });

    this.broadcastState();
  }

  removePlayer(socketId) {
    const player = this.players.get(socketId);
    if (!player) {
      return null;
    }

    player.socket.leave(this.id);
    this.players.delete(socketId);
    this.clearRoundTimeout();

    if (this.finished) {
      return null;
    }

    const opponent = this.getOpponent(socketId);
    if (opponent) {
      opponent.socket.emit('opponentLeft');
      return opponent.socket.id;
    }

    return null;
  }

  submitChoice(socketId, choice) {
    const player = this.players.get(socketId);
    if (!player || this.finished) {
      return;
    }

    if (!isValidChoice(choice)) {
      player.socket.emit('errorMessage', { message: 'Jogada inválida.' });
      return;
    }

    player.choice = choice;
    player.socket.emit('choiceRegistered', { round: this.round, choice });
    this.scheduleRoundTimeout();
    this.checkRound();
  }

  isEmpty() {
    return this.players.size === 0;
  }

  hasPlayer(socketId) {
    return this.players.has(socketId);
  }

  listPlayers() {
    return [...this.players.keys()];
  }

  getOpponent(socketId) {
    for (const [id, player] of this.players.entries()) {
      if (id !== socketId) {
        return player;
      }
    }
    return null;
  }

  checkRound() {
    if (this.finished || this.players.size < 2) {
      return;
    }

    const players = [...this.players.entries()];
    const [playerAId, playerA] = players[0];
    const [playerBId, playerB] = players[1];

    if (!playerA.choice || !playerB.choice) {
      return;
    }

    const outcome = determineRoundOutcome(playerA.choice, playerB.choice);
    this.clearRoundTimeout();

    if (outcome.result === 'a') {
      playerA.score += 1;
    } else if (outcome.result === 'b') {
      playerB.score += 1;
    }

    this.sendRoundResult({
      playerAId,
      playerA,
      playerBId,
      playerB,
      outcome: outcome.result
    });

    const winnerId = this.getMatchWinnerId();
    if (winnerId) {
      setTimeout(() => this.finishMatch(winnerId), ROUND_RESET_DELAY_MS);
      return;
    }

    setTimeout(() => {
      playerA.choice = null;
      playerB.choice = null;
      this.round += 1;
      this.broadcastState();
    }, ROUND_RESET_DELAY_MS);
  }

  sendRoundResult({ playerAId, playerA, playerBId, playerB, outcome }) {
    const payloadFor = (id) => {
      const isPlayerA = id === playerAId;
      const self = isPlayerA ? playerA : playerB;
      const opponent = isPlayerA ? playerB : playerA;
      const result =
        outcome === 'draw'
          ? 'draw'
          : (isPlayerA && outcome === 'a') || (!isPlayerA && outcome === 'b')
          ? 'win'
          : 'lose';

      return {
        roomId: this.id,
        round: this.round,
        result,
        you: {
          choice: self.choice,
          score: self.score
        },
        opponent: {
          choice: opponent.choice,
          score: opponent.score
        }
      };
    };

    playerA.socket.emit('roundResult', payloadFor(playerAId));
    playerB.socket.emit('roundResult', payloadFor(playerBId));
  }

  broadcastState() {
    const state = {
      roomId: this.id,
      round: this.round,
      pointsToWin: POINTS_TO_WIN,
      players: [...this.players.keys()].map((id) => {
        const player = this.players.get(id);
        return {
          id,
          score: player.score
        };
      })
    };

    this.io.to(this.id).emit('roomState', state);
  }

  getMatchWinnerId() {
    for (const [id, player] of this.players.entries()) {
      if (player.score >= POINTS_TO_WIN) {
        return id;
      }
    }
    return null;
  }

  finishMatch(winnerId) {
    if (this.finished) {
      return;
    }
    this.finished = true;
    this.clearRoundTimeout();

    const participants = [...this.players.entries()].map(([id, data]) => ({
      id,
      socket: data.socket,
      score: data.score
    }));

    const bestOf = POINTS_TO_WIN * 2 - 1;

    participants.forEach((participant) => {
      const opponent = participants.find((p) => p.id !== participant.id) ?? null;
      participant.socket.emit('matchFinished', {
        roomId: this.id,
        winnerId,
        bestOf,
        you: {
          id: participant.id,
          score: participant.score,
          didWin: participant.id === winnerId
        },
        opponent: opponent
          ? {
              id: opponent.id,
              score: opponent.score
            }
          : null
      });
    });

    if (typeof this.onFinish === 'function') {
      this.onFinish({
        roomId: this.id,
        winnerId,
        playerIds: participants.map((participant) => participant.id)
      });
    }

    this.broadcastState();
  }

  destroy() {
    this.clearRoundTimeout();
    for (const [, player] of this.players.entries()) {
      player.socket.leave(this.id);
    }
    this.players.clear();
    this.finished = true;
  }

  scheduleRoundTimeout() {
    this.clearRoundTimeout();
    this.roundTimeout = setTimeout(() => this.handleRoundTimeout(), CHOICE_TIMEOUT_MS);
  }

  clearRoundTimeout() {
    if (this.roundTimeout) {
      clearTimeout(this.roundTimeout);
      this.roundTimeout = null;
    }
  }

  handleRoundTimeout() {
    if (this.finished || this.players.size < 2) {
      this.clearRoundTimeout();
      return;
    }

    const players = [...this.players.entries()];
    const [playerAEntry, playerBEntry] = players;
    const playerA = playerAEntry?.[1];
    const playerB = playerBEntry?.[1];

    if (!playerA || !playerB) {
      this.clearRoundTimeout();
      return;
    }

    const allSelected = playerA.choice && playerB.choice;
    if (allSelected) {
      this.clearRoundTimeout();
      this.checkRound();
      return;
    }

    for (const [, player] of players) {
      if (player.choice) {
        player.choice = null;
      }
      player.socket.emit('choiceReset', {
        round: this.round,
        reason: 'timeout'
      });
    }

    this.clearRoundTimeout();
    this.broadcastState();
  }
}

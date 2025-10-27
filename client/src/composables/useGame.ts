import { io, type Socket } from 'socket.io-client';
import { reactive, readonly } from 'vue';

type GameStatus = 'connecting' | 'idle' | 'queue' | 'matched' | 'opponent-left' | 'disconnected' | 'completed';

export type ChoiceKey = 'rock' | 'paper' | 'scissors';

export interface RoundSummary {
  roomId: string;
  round: number;
  result: 'win' | 'lose' | 'draw';
  you: {
    choice: ChoiceKey;
    score: number;
  };
  opponent: {
    choice: ChoiceKey;
    score: number;
  };
}

export interface MatchSummary {
  roomId: string;
  winnerId: string;
  bestOf: number;
  you: {
    id: string;
    score: number;
    didWin: boolean;
  };
  opponent: {
    id: string;
    score: number;
  } | null;
}

export interface GameState {
  status: GameStatus;
  playerId?: string;
  opponentId?: string;
  roomId?: string;
  queueSize: number;
  roomsOnline: number;
  pointsToWin: number;
  score: {
    you: number;
    opponent: number;
  };
  pendingChoice: ChoiceKey | null;
  lastRound: RoundSummary | null;
  error: string | null;
  matchSummary: MatchSummary | null;
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:4000';

const defaultState: GameState = {
  status: 'connecting',
  queueSize: 0,
  roomsOnline: 0,
  pointsToWin: 3,
  score: { you: 0, opponent: 0 },
  pendingChoice: null,
  lastRound: null,
  error: null,
  matchSummary: null
};

const state = reactive<GameState>({ ...defaultState });

let socket: Socket | null = null;
let hasConnected = false;
let errorTimer: ReturnType<typeof setTimeout> | null = null;

export function useGame() {
  if (!hasConnected) {
    connect();
    hasConnected = true;
  }

  return {
    state: readonly(state),
    joinQueue,
    cancelQueue,
    submitChoice,
    acknowledgeMatch,
    resetAfterOpponentLeft
  };
}

function connect() {
  if (socket) {
    return;
  }

  socket = io(SERVER_URL, {
    autoConnect: true
  });

  socket.on('connect', () => {
    setError(null);
    patchState({
      status: 'idle'
    });
  });

  socket.on('disconnect', () => {
    patchState({
      status: 'disconnected',
      opponentId: undefined,
      roomId: undefined
    });
  });

  socket.on('welcome', ({ playerId }) => {
    patchState({ playerId });
  });

  socket.on('queueSize', ({ size }) => {
    patchState({ queueSize: size });
  });

  socket.on('roomsOnline', ({ rooms }) => {
    patchState({ roomsOnline: rooms });
  });

  socket.on('queueJoined', () => {
    setError(null);
    patchState({
      status: 'queue',
      pendingChoice: null,
      lastRound: null,
      matchSummary: null
    });
  });

  socket.on('queueLeft', () => {
    patchState({ status: 'idle' });
  });

  socket.on('matchStarted', ({ roomId, opponent }) => {
    patchState({
      status: 'matched',
      roomId,
      opponentId: opponent?.id,
      pendingChoice: null,
      lastRound: null,
      matchSummary: null,
      score: { you: 0, opponent: 0 }
    });
  });

  socket.on('matchAlreadyRunning', () => {
    emitError('Voce ja esta em uma partida.');
  });

  socket.on('roomState', ({ players, pointsToWin }) => {
    const you = players?.find((p: { id: string }) => p.id === state.playerId);
    const opponent = players?.find((p: { id: string }) => p.id !== state.playerId);

    patchState({
      pointsToWin: pointsToWin ?? state.pointsToWin,
      score: {
        you: you?.score ?? state.score.you,
        opponent: opponent?.score ?? state.score.opponent
      }
    });
  });

  socket.on('choiceRegistered', ({ choice }) => {
    patchState({ pendingChoice: choice });
  });

  socket.on('roundResult', (payload: RoundSummary) => {
    patchState({
      pendingChoice: null,
      score: {
        you: payload.you.score,
        opponent: payload.opponent.score
      },
      lastRound: payload,
      roomId: payload.roomId
    });
  });

  socket.on('choiceReset', ({ reason }) => {
    patchState({ pendingChoice: null });
    if (reason === 'timeout') {
      setError('Tempo esgotado. Rodada reiniciada.');
    } else {
      setError(null);
    }
  });

  socket.on('opponentLeft', () => {
    patchState({
      status: 'opponent-left',
      opponentId: undefined,
      matchSummary: null,
      pendingChoice: null
    });
  });

  socket.on('matchFinished', (payload: MatchSummary) => {
    patchState({
      status: 'completed',
      roomId: payload.roomId,
      opponentId: payload.opponent?.id,
      pendingChoice: null,
      matchSummary: payload,
      score: {
        you: payload.you.score,
        opponent: payload.opponent?.score ?? state.score.opponent
      }
    });
  });

  socket.on('errorMessage', ({ message }) => {
    emitError(message);
  });

  socket.on('connect_error', (error) => {
    emitError(error.message);
  });
}

function joinQueue() {
  if (!socket?.connected) {
    setError('Ainda conectando ao servidor.');
    return;
  }
  socket.emit('joinQueue');
}

function cancelQueue() {
  if (!socket?.connected) {
    return;
  }
  socket.emit('cancelQueue');
}

function submitChoice(choice: ChoiceKey) {
  if (!socket?.connected) {
    setError('Conexao com o servidor perdida.');
    return;
  }

  if (state.pendingChoice || state.status !== 'matched') {
    return;
  }

  socket.emit('submitChoice', { choice });
  patchState({ pendingChoice: choice });
}

function acknowledgeMatch() {
  setError(null);
  patchState({
    status: 'idle',
    opponentId: undefined,
    roomId: undefined,
    pendingChoice: null,
    lastRound: null,
    matchSummary: null,
    score: { you: 0, opponent: 0 }
  });
}

function resetAfterOpponentLeft() {
  setError(null);
  patchState({
    status: 'idle',
    opponentId: undefined,
    roomId: undefined,
    pendingChoice: null,
    lastRound: null,
    matchSummary: null,
    score: { you: 0, opponent: 0 }
  });
}

function patchState(partial: Partial<GameState>) {
  Object.assign(state, {
    ...state,
    ...partial,
    roomsOnline: partial.roomsOnline ?? state.roomsOnline,
    score: partial.score ?? state.score,
    pointsToWin: partial.pointsToWin ?? state.pointsToWin,
    pendingChoice:
      partial.pendingChoice === undefined ? state.pendingChoice : partial.pendingChoice,
    lastRound: partial.lastRound === undefined ? state.lastRound : partial.lastRound,
    error: partial.error === undefined ? state.error : partial.error,
    matchSummary:
      partial.matchSummary === undefined ? state.matchSummary : partial.matchSummary
  });
}

function emitError(message: string) {
  setError(message);
}

function setError(message: string | null) {
  if (errorTimer) {
    clearTimeout(errorTimer);
    errorTimer = null;
  }

  patchState({ error: message ?? null });

  if (message) {
    errorTimer = setTimeout(() => {
      patchState({ error: null });
      errorTimer = null;
    }, 3000);
  }
}

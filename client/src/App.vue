<template>
  <div class="min-h-screen bg-slate-100 text-slate-800">
    <transition name="fade-slide" mode="out-in">
      <LobbyView
        v-if="!isGameView"
        key="lobby"
        :state="state"
        :status-text="statusText"
        :info-text="infoText"
        :join-label="joinLabel"
        :can-join="canJoin"
        :can-cancel="canCancel"
        @join="handleJoin"
        @cancel="cancelQueue"
      />
      <GameView
        v-else
        key="game"
        :state="state"
        :status-text="statusText"
        :info-text="infoText"
        :choices="choices"
        :can-play="canPlay"
        :best-of-rounds="bestOfRounds"
        :opponent-label="opponentLabel"
        @choice="submitChoice"
      />
    </transition>

    <transition name="fade">
      <div
        v-if="state.matchSummary"
        class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4"
      >
        <div class="match-card max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-2xl">
          <h2
            class="text-sm font-semibold uppercase tracking-[0.4em]"
            :class="state.matchSummary.you.didWin ? 'text-green-600' : 'text-rose-600'"
          >
            {{ state.matchSummary.you.didWin ? 'Vitoria!' : 'Derrota' }}
          </h2>
          <p class="mt-3 text-sm text-slate-600">
            Placar final: Voce {{ state.matchSummary.you.score }} x
            {{ state.matchSummary.opponent?.score ?? 0 }} Oponente
          </p>
          <p class="mt-1 text-xs text-slate-500">
            Melhor de {{ state.matchSummary.bestOf }} - retornando ao saguao em instantes...
          </p>
          <button
            type="button"
            class="mt-5 rounded-full bg-blue-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white shadow-lg transition hover:bg-blue-600"
            @click="acknowledgeMatch"
          >
            Voltar agora
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LobbyView from './components/LobbyView.vue';
import GameView from './components/GameView.vue';
import { useGame } from './composables/useGame';
import type { ChoiceKey } from './composables/useGame';

const {
  state,
  joinQueue,
  cancelQueue,
  submitChoice,
  acknowledgeMatch,
  resetAfterOpponentLeft
} = useGame();

const choices: Array<{ value: ChoiceKey; label: string }> = [
  { value: 'rock', label: 'Pedra' },
  { value: 'paper', label: 'Papel' },
  { value: 'scissors', label: 'Tesoura' }
];

const isGameView = computed(() => state.status === 'matched' || state.status === 'completed');

const statusText = computed((): string => {
  switch (state.status) {
    case 'connecting':
      return 'Conectando ao servidor...';
    case 'idle':
      return 'Pronto para entrar na fila.';
    case 'queue':
      return 'Procurando adversario...';
    case 'matched':
      return 'Partida ativa! Faca sua jogada.';
    case 'opponent-left':
      return 'Oponente saiu da partida.';
    case 'disconnected':
      return 'Conexao perdida. Tentando recuperar...';
    case 'completed':
      return 'Partida concluida!';
    default:
      return 'Status desconhecido';
  }
});

const infoText = computed((): string => {
  if (state.error) {
    return state.error;
  }

  switch (state.status) {
    case 'queue':
      return 'Voce pode cancelar a busca a qualquer momento.';
    case 'matched':
      return state.pendingChoice
        ? `Voce escolheu ${translateChoice(state.pendingChoice)}. Aguardando o oponente...`
        : 'Selecione Pedra, Papel ou Tesoura para jogar.';
    case 'opponent-left':
      return 'Seu oponente saiu. Clique em "Buscar nova partida" para voltar a fila.';
    case 'idle':
      return 'Clique em "Entrar na fila" para desafiar outro jogador.';
    case 'completed':
      return 'Fim de jogo! Parabens pela partida.';
    default:
      return '';
  }
});

const canJoin = computed(() => state.status === 'idle' || state.status === 'opponent-left');
const canCancel = computed(() => state.status === 'queue');
const canPlay = computed(() => state.status === 'matched');

const joinLabel = computed(() =>
  state.status === 'opponent-left' ? 'Buscar nova partida' : 'Entrar na fila'
);

const bestOfRounds = computed(() => state.pointsToWin * 2 - 1);
const opponentLabel = computed(() => state.opponentId?.slice(0, 6) ?? 'Aguardando...');

function handleJoin() {
  if (state.status === 'opponent-left') {
    resetAfterOpponentLeft();
  }
  joinQueue();
}

function translateChoice(choice?: ChoiceKey | null): string {
  if (!choice) return '--';
  switch (choice) {
    case 'rock':
      return 'Pedra';
    case 'paper':
      return 'Papel';
    case 'scissors':
      return 'Tesoura';
    default:
      return '--';
  }
}
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.match-card {
  animation: pop-in 0.35s ease;
}

@keyframes pop-in {
  0% {
    opacity: 0;
    transform: scale(0.85) translateY(20px);
  }
  60% {
    opacity: 1;
    transform: scale(1.03) translateY(-6px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>

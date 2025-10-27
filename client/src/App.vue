<template>
  <div class="app-shell min-h-screen bg-slate-100 text-slate-800">
    <div class="language-switcher-wrapper">
      <LanguageSwitcher />
    </div>

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
        @acknowledge-opponent="resetAfterOpponentLeft"
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
      <RoundResultModal
        v-if="state.roundModal"
        :summary="state.roundModal"
        :points-to-win="state.pointsToWin"
        @close="acknowledgeRound"
      />
    </transition>

    <transition name="fade">
      <MatchSummaryModal
        v-if="state.matchSummary && !state.roundModal"
        :summary="state.matchSummary"
        @close="acknowledgeMatch"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LobbyView from './components/LobbyView.vue';
import GameView from './components/GameView.vue';
import MatchSummaryModal from './components/MatchSummaryModal.vue';
import RoundResultModal from './components/RoundResultModal.vue';
import LanguageSwitcher from './components/LanguageSwitcher.vue';
import { useGame } from './composables/useGame';
import type { ChoiceKey } from './composables/useGame';
import { useI18n, translateChoiceLabel } from './i18n';

const {
  state,
  joinQueue,
  cancelQueue,
  submitChoice,
  acknowledgeRound,
  acknowledgeMatch,
  resetAfterOpponentLeft
} = useGame();

const { t } = useI18n();

const choices = computed<Array<{ value: ChoiceKey; label: string }>>(() => [
  { value: 'rock', label: t('common.rock') },
  { value: 'paper', label: t('common.paper') },
  { value: 'scissors', label: t('common.scissors') }
]);

const isGameView = computed(() => state.status === 'matched' || state.status === 'completed');

const statusText = computed((): string => {
  const key = state.status ? `status.${state.status}` : 'status.unknown';
  return t(key);
});

const infoText = computed((): string => {
  if (state.error) {
    return state.error;
  }

  switch (state.status) {
    case 'queue':
      return t('info.queue');
    case 'matched':
      return state.pendingChoice
        ? t('info.matchedPending', { choice: translateChoiceLabel(state.pendingChoice) })
        : t('info.matchedIdle');
    case 'opponent-left':
      return t('info.opponentLeft');
    case 'idle':
      return t('info.idle');
    case 'completed':
      return t('info.completed');
    default:
      return t('info.empty');
  }
});

const canJoin = computed(() => state.status === 'idle' || state.status === 'opponent-left');
const canCancel = computed(() => state.status === 'queue');
const canPlay = computed(() => state.status === 'matched' && !state.roundModal);

const joinLabel = computed(() =>
  state.status === 'opponent-left' ? t('common.searchNewMatch') : t('common.enterQueue')
);

const bestOfRounds = computed(() => state.pointsToWin * 2 - 1);
const opponentLabel = computed(() => state.opponentId?.slice(0, 6) ?? t('common.awaiting'));

function handleJoin() {
  if (state.status === 'opponent-left') {
    resetAfterOpponentLeft();
  }
  joinQueue();
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

.language-switcher-wrapper {
  position: fixed;
  top: 1.25rem;
  right: 1.5rem;
  z-index: 60;
}
</style>


<template>
  <div class="arena">
    <header class="arena__hero">
      <div class="arena__room">
        <span class="room-pill">Sala #{{ roomCode }}</span>
        <span class="room-presence">
          {{ state.roomsOnline }} sala{{ state.roomsOnline === 1 ? '' : 's' }} em jogo agora
        </span>
      </div>

      <div class="arena__score" :class="scoreGlowClass">
        <div class="score-side">
          <span class="score-label">Voce</span>
          <span class="score-value">{{ state.score.you }}</span>
        </div>
        <div class="score-divider">vs</div>
        <div class="score-side">
          <span class="score-label">Oponente</span>
          <span class="score-value">{{ state.score.opponent }}</span>
        </div>
      </div>
    </header>

    <section class="arena__meta">
      <div class="meta-card">
        <p class="meta-eyebrow">Formato</p>
        <h2>Melhor de {{ bestOfRounds }}</h2>
        <p>Primeiro a {{ state.pointsToWin }} ponto(s) ganha a batalha.</p>
        <div class="meta-progress">
          <div
            v-for="index in bestOfRounds"
            :key="index"
            class="meta-progress__dot"
            :class="progressClass(index)"
          />
        </div>
        <div class="meta-status">
          <span class="meta-status__label">Status</span>
          <span class="meta-status__value">{{ statusText }}</span>
        </div>
        <p class="meta-note">{{ infoText }}</p>
      </div>

      <div class="meta-card" :class="resultHighlightClass">
        <p class="meta-eyebrow">Rodada</p>
        <template v-if="state.lastRound">
          <p>
            Voce jogou <strong>{{ translateChoice(state.lastRound.you.choice) }}</strong> e o oponente
            <strong>{{ translateChoice(state.lastRound.opponent.choice) }}</strong>.
          </p>
          <p class="meta-result" :class="roundResultClass(state.lastRound.result)">
            {{ roundResultLabel(state.lastRound.result) }} - Rodada {{ state.lastRound.round }}
          </p>
        </template>
        <p v-else>Aguardando a primeira rodada...</p>
      </div>

      <div class="meta-card">
        <p class="meta-eyebrow">Sala</p>
        <ul>
          <li>Identificador: {{ state.roomId ?? 'carregando...' }}</li>
          <li>Oponente: {{ opponentLabel }}</li>
          <li>Rodadas curtas, ritmo acelerado.</li>
        </ul>
      </div>
    </section>

    <section class="arena__actions">
      <p class="actions-eyebrow">Escolha sua jogada</p>
      <div class="actions-grid">
        <button
          v-for="choice in choices"
          :key="choice.value"
          type="button"
          class="actions-choice__button"
          :class="choiceClass(choice.value)"
          :disabled="!canPlay || state.pendingChoice !== null"
          @click="$emit('choice', choice.value)"
        >
          <span class="choice-icon">{{ choiceIcon(choice.value) }}</span>
          <span class="choice-label">{{ choice.label }}</span>
        </button>
      </div>
      <transition name="pointer">
        <div v-if="showPointer" class="pointer-banner">Sua vez!</div>
      </transition>

      <p v-if="state.pendingChoice" class="actions-hint">
        Voce escolheu <strong>{{ translateChoice(state.pendingChoice) }}</strong>. Aguardando o oponente...
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue';
import type { ChoiceKey, GameState, RoundSummary } from '../composables/useGame';

const props = defineProps<{
  state: GameState;
  statusText: string;
  infoText: string;
  choices: Array<{ value: ChoiceKey; label: string }>;
  canPlay: boolean;
  bestOfRounds: number;
  opponentLabel: string;
}>();

defineEmits<{
  (e: 'choice', value: ChoiceKey): void;
}>();

const resultFlash = ref<'win' | 'lose' | 'draw' | null>(null);
const showPointer = computed(() => props.canPlay && props.state.pendingChoice === null);
const roomCode = computed(() =>
  props.state.roomId ? props.state.roomId.slice(0, 6).toUpperCase() : '------'
);

let flashTimer: ReturnType<typeof setTimeout> | null = null;

watch(
  () => props.state.lastRound?.round,
  (round) => {
    if (round) {
      resultFlash.value = props.state.lastRound?.result ?? null;
      if (flashTimer) clearTimeout(flashTimer);
      flashTimer = setTimeout(() => {
        resultFlash.value = null;
      }, 1600);
    }
  }
);

onBeforeUnmount(() => {
  if (flashTimer) clearTimeout(flashTimer);
});

const scoreGlowClass = computed(() => {
  switch (resultFlash.value) {
    case 'win':
      return 'arena__score--win';
    case 'lose':
      return 'arena__score--lose';
    case 'draw':
      return 'arena__score--draw';
    default:
      return '';
  }
});

const resultHighlightClass = computed(() => {
  if (!resultFlash.value) {
    return '';
  }
  return `meta-card--${resultFlash.value}`;
});

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

function roundResultLabel(result: RoundSummary['result']): string {
  switch (result) {
    case 'win':
      return 'Voce venceu a rodada';
    case 'lose':
      return 'Voce perdeu a rodada';
    case 'draw':
      return 'Empate';
  }
  return 'Empate';
}

function roundResultClass(result: RoundSummary['result']) {
  switch (result) {
    case 'win':
      return 'text-win';
    case 'lose':
      return 'text-lose';
    case 'draw':
      return 'text-draw';
  }
  return '';
}

function progressClass(index: number) {
  const total = props.state.score.you + props.state.score.opponent;
  if (index <= props.state.score.you) {
    return 'meta-progress__dot--you';
  }
  if (index <= total) {
    return 'meta-progress__dot--opponent';
  }
  return '';
}

function choiceClass(choice: ChoiceKey) {
  const list: string[] = [];
  if (props.state.pendingChoice === choice) {
    list.push('actions-choice__button--selected');
  } else if (showPointer.value) {
    list.push('actions-choice__button--ready');
  }
  return list;
}

function choiceIcon(choice: ChoiceKey) {
  switch (choice) {
    case 'rock':
      return 'R';
    case 'paper':
      return 'P';
    case 'scissors':
      return 'S';
  }
}
</script>

<style scoped>
.arena {
  display: grid;
  gap: 2.5rem;
  padding: 3rem 1.5rem 4rem;
}

.arena__hero {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

@media (min-width: 768px) {
  .arena__hero {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.room-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 1.4rem;
  border-radius: 9999px;
  background: rgba(56, 189, 248, 0.18);
  border: 1px solid rgba(56, 189, 248, 0.35);
  font-weight: 700;
  letter-spacing: 0.12em;
}

.room-presence {
  display: inline-flex;
  align-items: center;
  margin-left: 0.8rem;
  font-weight: 600;
  color: #0f4c81;
}

.arena__score {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.4rem;
  padding: 1.1rem 1.6rem;
  border-radius: 24px;
  background: linear-gradient(145deg, rgba(56, 189, 248, 0.18), rgba(5, 150, 105, 0.22));
  border: 2px solid rgba(148, 163, 184, 0.35);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.75);
  align-items: center;
  transition: box-shadow 0.25s ease;
}

.arena__score--win {
  animation: scoreGlowWin 1.4s ease;
}
.arena__score--lose {
  animation: scoreGlowLose 1.4s ease;
}
.arena__score--draw {
  animation: scoreGlowDraw 1.4s ease;
}

.score-side {
  display: grid;
  gap: 0.3rem;
  text-align: center;
}

.score-label {
  font-size: 0.75rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  font-weight: 600;
  color: #0f172a;
}

.score-value {
  font-size: 2.6rem;
  font-family: 'Press Start 2P', monospace;
  line-height: 1;
  color: #0f172a;
}

.score-divider {
  font-size: 0.85rem;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  text-align: center;
  font-weight: 700;
  color: #1d4ed8;
}

.arena__meta {
  display: grid;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .arena__meta {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.meta-card {
  border-radius: 24px;
  border: 2px solid rgba(226, 232, 240, 0.9);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 24px 55px rgba(15, 23, 42, 0.08);
  padding: 1.75rem;
  display: grid;
  gap: 1rem;
}

.meta-card h2 {
  font-size: 1.6rem;
  font-weight: 700;
  color: #12263a;
}

.meta-card p, .meta-card li {
  color: #475569;
  font-size: 0.95rem;
}

.meta-card ul {
  margin: 0;
  padding-left: 1.2rem;
  display: grid;
  gap: 0.55rem;
}

.meta-eyebrow {
  font-size: 0.7rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #94a3b8;
  font-weight: 600;
}

.meta-progress {
  display: flex;
  gap: 0.6rem;
}

.meta-progress__dot {
  flex: 1;
  height: 10px;
  border-radius: 9999px;
  background: rgba(226, 232, 240, 0.9);
}

.meta-progress__dot--you {
  background: rgba(16, 185, 129, 0.8);
}

.meta-progress__dot--opponent {
  background: rgba(248, 113, 113, 0.8);
}

.meta-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.8rem 1rem;
  border-radius: 14px;
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.18);
  margin-top: 0.3rem;
}

.meta-status__label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.24em;
  font-weight: 600;
  color: #0f4c81;
}

.meta-status__value {
  font-weight: 600;
  color: #0f172a;
}

.meta-note {
  font-size: 0.9rem;
  color: #475569;
}

.meta-result {
  font-weight: 700;
  margin-top: 0.4rem;
}

.meta-card--win {
  animation: infoGlowWin 1.2s ease;
}
.meta-card--lose {
  animation: infoGlowLose 1.2s ease;
}
.meta-card--draw {
  animation: infoGlowDraw 1.2s ease;
}

.text-win {
  color: #16a34a;
}
.text-lose {
  color: #dc2626;
}
.text-draw {
  color: #d97706;
}

.arena__actions {
  border-radius: 24px;
  border: 2px solid rgba(226, 232, 240, 0.9);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 24px 55px rgba(15, 23, 42, 0.08);
  padding: 1.75rem;
  display: grid;
  gap: 1.25rem;
}

.actions-eyebrow {
  font-size: 0.7rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #94a3b8;
  font-weight: 600;
}

.actions-grid {
  display: grid;
  gap: 1rem;
}

@media (min-width: 640px) {
  .actions-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.actions-choice__button {
  display: grid;
  justify-items: center;
  gap: 0.35rem;
  padding: 1.35rem 1rem;
  border-radius: 20px;
  border: 1px solid rgba(203, 213, 225, 0.9);
  background: rgba(248, 250, 252, 0.92);
  font-weight: 700;
  font-size: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border 0.2s ease;
  cursor: pointer;
}

.actions-choice__button--ready {
  animation: gentlePulse 1.8s ease-in-out infinite;
}

.actions-choice__button--selected {
  border-color: rgba(37, 99, 235, 0.6);
  box-shadow: 0 20px 40px rgba(37, 99, 235, 0.25);
  transform: translateY(-3px);
}

.actions-choice__button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  animation: none;
}

.choice-icon {
  font-size: 1.8rem;
  font-family: 'Baloo 2', sans-serif;
  color: #0f172a;
}

.choice-label {
  font-size: 0.9rem;
  color: #475569;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.pointer-banner {
  justify-self: center;
  background: linear-gradient(135deg, #38bdf8, #1d4ed8);
  color: #ffffff;
  padding: 0.55rem 1.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  font-weight: 700;
  box-shadow: 0 20px 40px rgba(37, 99, 235, 0.35);
}

.pointer-enter-active,
.pointer-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.pointer-enter-from,
.pointer-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.actions-hint {
  font-size: 0.9rem;
  color: #2563eb;
  text-align: center;
}

@keyframes pulseDot {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.35);
    opacity: 0.45;
  }
}

@keyframes scoreGlowWin {
  0% {
    box-shadow: 0 0 0 rgba(34, 197, 94, 0);
  }
  30% {
    box-shadow: 0 0 40px rgba(34, 197, 94, 0.55);
  }
  100% {
    box-shadow: 0 0 0 rgba(34, 197, 94, 0);
  }
}

@keyframes scoreGlowLose {
  0% {
    box-shadow: 0 0 0 rgba(244, 63, 94, 0);
  }
  30% {
    box-shadow: 0 0 40px rgba(244, 63, 94, 0.55);
  }
  100% {
    box-shadow: 0 0 0 rgba(244, 63, 94, 0);
  }
}

@keyframes scoreGlowDraw {
  0% {
    box-shadow: 0 0 0 rgba(245, 158, 11, 0);
  }
  30% {
    box-shadow: 0 0 40px rgba(245, 158, 11, 0.55);
  }
  100% {
    box-shadow: 0 0 0 rgba(245, 158, 11, 0);
  }
}

@keyframes infoGlowWin {
  0% {
    transform: scale(0.97);
    border-color: rgba(34, 197, 94, 0.35);
  }
  30% {
    transform: scale(1.02);
    border-color: rgba(34, 197, 94, 0.6);
    box-shadow: 0 14px 36px rgba(34, 197, 94, 0.28);
  }
  100% {
    transform: scale(1);
    border-color: rgba(226, 232, 240, 0.9);
    box-shadow: none;
  }
}

@keyframes infoGlowLose {
  0% {
    transform: scale(0.97);
    border-color: rgba(244, 63, 94, 0.35);
  }
  30% {
    transform: scale(1.02);
    border-color: rgba(244, 63, 94, 0.6);
    box-shadow: 0 14px 36px rgba(244, 63, 94, 0.28);
  }
  100% {
    transform: scale(1);
    border-color: rgba(226, 232, 240, 0.9);
    box-shadow: none;
  }
}

@keyframes infoGlowDraw {
  0% {
    transform: scale(0.97);
    border-color: rgba(245, 158, 11, 0.35);
  }
  30% {
    transform: scale(1.02);
    border-color: rgba(245, 158, 11, 0.6);
    box-shadow: 0 14px 36px rgba(245, 158, 11, 0.28);
  }
  100% {
    transform: scale(1);
    border-color: rgba(226, 232, 240, 0.9);
    box-shadow: none;
  }
}

@keyframes gentlePulse {
  0%, 100% {
    transform: translateY(0);
    box-shadow: 0 0 0 rgba(37, 99, 235, 0);
  }
  50% {
    transform: translateY(-3px);
    box-shadow: 0 16px 32px rgba(37, 99, 235, 0.2);
  }
}
</style>

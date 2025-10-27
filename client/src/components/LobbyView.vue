<template>
  <div class="lobby">
    <div class="lobby__orb lobby__orb--one"></div>
    <div class="lobby__orb lobby__orb--two"></div>

    <section
      class="lobby-card"
      :class="{ 'lobby-card--dim': ['queue', 'opponent-left'].includes(state.status) }"
    >
      <div class="lobby-card__head">
        <span class="lobby-badge">{{ t('lobby.hallBadge') }}</span>
        <h1>{{ t('lobby.headline') }}</h1>
        <p>{{ t('lobby.description') }}</p>
      </div>

      <div class="lobby-card__body">
        <div class="lobby-card__stat">
          <span class="stat-label">{{ t('lobby.roomsLabel') }}</span>
          <span class="stat-value">
            {{ state.roomsOnline }}
            <small>{{ t('lobby.live') }}</small>
          </span>
        </div>
        <div class="lobby-card__actions">
          <button class="button button--primary" :disabled="!canJoin" @click="$emit('join')">
            {{ joinLabel }}
          </button>
          <button class="button button--ghost" :disabled="!canCancel" @click="$emit('cancel')">
            {{ t('common.cancel') }}
          </button>
        </div>
      </div>
    </section>

    <transition name="queue">
      <div v-if="state.status === 'queue'" class="queue-overlay">
        <div class="queue-panel">
          <div class="queue-spinner">
            <span class="queue-spinner__dot queue-spinner__dot--one"></span>
            <span class="queue-spinner__dot queue-spinner__dot--two"></span>
            <span class="queue-spinner__dot queue-spinner__dot--three"></span>
          </div>
          <p class="queue-eyebrow">{{ t('queueOverlay.searching') }}</p>
          <h2>{{ t('queueOverlay.headline') }}</h2>
          <p class="queue-note">
            {{ t('queueOverlay.players', { count: state.queueSize }) }}
          </p>
          <div class="queue-tips">
            <p>{{ t('queueOverlay.meanwhile') }}</p>
            <ul>
              <li>{{ t('queueOverlay.tipConnection') }}</li>
              <li>{{ t('queueOverlay.tipStrategy') }}</li>
              <li>{{ t('queueOverlay.tipCancel') }}</li>
            </ul>
          </div>
          <button type="button" class="queue-cancel" @click="$emit('cancel')">
            {{ t('queueOverlay.cancel') }}
          </button>
        </div>
      </div>
    </transition>

    <transition name="opponent">
      <div v-if="state.status === 'opponent-left'" class="opponent-overlay">
        <div class="opponent-panel">
          <div class="opponent-icon">
            <span class="opponent-icon__wave"></span>
            <span class="opponent-icon__wave opponent-icon__wave--delay"></span>
            <span class="opponent-icon__avatar">?</span>
          </div>
          <p class="opponent-eyebrow">{{ t('opponentOverlay.eyebrow') }}</p>
          <h2>{{ t('opponentOverlay.headline') }}</h2>
          <p class="opponent-note">
            {{ t('opponentOverlay.note') }}
          </p>
          <div class="opponent-actions">
            <button type="button" class="opponent-button opponent-button--primary" @click="$emit('join')">
              {{ t('common.searchNewMatch') }}
            </button>
            <button
              type="button"
              class="opponent-button opponent-button--ghost"
              @click="$emit('acknowledge-opponent')"
            >
              {{ t('opponentOverlay.back') }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <section
      class="lobby-grid"
      :class="{ 'lobby-grid--blur': ['queue', 'opponent-left'].includes(state.status) }"
    >
      <article class="info-tile">
        <header>
          <span class="info-avatar">{{ t('lobby.statusAbbrev') }}</span>
          <div>
            <p class="info-title">{{ t('lobby.status') }}</p>
            <p class="info-sub">{{ statusText }}</p>
          </div>
        </header>
        <ul>
          <li>{{ t('lobby.queueList', { count: state.queueSize }) }}</li>
          <li>{{ t('lobby.queueAdvice') }}</li>
          <li>{{ t('lobby.queueFollowUp') }}</li>
        </ul>
      </article>

      <article class="info-tile">
        <header>
          <span class="info-avatar info-avatar--blue">{{ t('lobby.howAbbrev') }}</span>
          <div>
            <p class="info-title">{{ t('lobby.howItWorks') }}</p>
            <p class="info-sub">{{ t('lobby.bestOf') }}</p>
          </div>
        </header>
        <ol>
          <li>{{ t('lobby.step1') }}</li>
          <li>{{ t('lobby.step2') }}</li>
          <li>{{ t('lobby.step3', { points: state.pointsToWin }) }}</li>
        </ol>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { GameState } from '../composables/useGame';
import { useI18n } from '../i18n';

defineProps<{
  state: GameState;
  statusText: string;
  infoText: string;
  joinLabel: string;
  canJoin: boolean;
  canCancel: boolean;
}>();

defineEmits<{
  (e: 'join'): void;
  (e: 'cancel'): void;
  (e: 'acknowledge-opponent'): void;
}>();

const { t } = useI18n();
</script>

<style scoped>
.lobby {
  position: relative;
  min-height: 100vh;
  display: grid;
  gap: 2.5rem;
  place-items: center;
  padding: 4rem 1.5rem 5rem;
  overflow: hidden;
}

.lobby__orb {
  position: absolute;
  border-radius: 9999px;
  opacity: 0.45;
  z-index: 0;
}

.lobby__orb--one {
  width: 360px;
  height: 360px;
  top: -120px;
  left: -90px;
  background: linear-gradient(120deg, #58cc02, #a0e86f);
}

.lobby__orb--two {
  width: 300px;
  height: 300px;
  bottom: -110px;
  right: -85px;
  background: linear-gradient(120deg, #1cb0f6, #88d9ff);
}

.lobby-card {
  position: relative;
  width: min(100%, 900px);
  border-radius: 32px;
  border: 2px solid rgba(255, 255, 255, 0.75);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 35px 70px rgba(15, 23, 42, 0.12);
  overflow: hidden;
  padding: 2.6rem 2.4rem;
  display: grid;
  gap: 2.25rem;
  z-index: 1;
}

.lobby-card__head {
  display: grid;
  gap: 1rem;
}

.lobby-card__head h1 {
  font-size: 2.1rem;
  font-weight: 800;
  color: #102a43;
}

.lobby-card__head p {
  color: #4b5563;
  max-width: 680px;
  line-height: 1.6;
}

.lobby-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.45rem 1.4rem;
  border-radius: 9999px;
  background: rgba(88, 204, 2, 0.16);
  border: 1px solid rgba(88, 204, 2, 0.35);
  font-size: 0.7rem;
  letter-spacing: 0.26em;
  font-weight: 700;
  text-transform: uppercase;
  color: #0f4c3a;
}

.lobby-card__body {
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
  align-items: flex-start;
}

.lobby-card__stat {
  display: flex;
  align-items: baseline;
  gap: 1.2rem;
  font-size: 2.6rem;
  font-weight: 800;
  color: #0f4c81;
}

.stat-label {
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: #64748b;
}

.stat-value {
  display: inline-flex;
  align-items: baseline;
  gap: 0.6rem;
}

.stat-value small {
  font-size: 0.9rem;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.lobby-card__actions {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  width: 100%;
}

@media (min-width: 768px) {
  .lobby-card__actions {
    flex-direction: row;
    justify-content: flex-end;
  }
  .button {
    min-width: 220px;
  }
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 9999px;
  padding: 0.85rem 1.8rem;
  font-size: 0.85rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.button--primary {
  background: linear-gradient(135deg, #58cc02, #2ea024);
  color: #ffffff;
  box-shadow: 0 18px 35px rgba(88, 204, 2, 0.32);
}

.button--primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 24px 45px rgba(88, 204, 2, 0.42);
}

.button--ghost {
  background: rgba(255, 255, 255, 0.9);
  color: #1f2937;
  border: 1px solid rgba(15, 23, 42, 0.12);
  box-shadow: 0 10px 20px rgba(148, 163, 184, 0.18);
}

.button--ghost:hover:not(:disabled) {
  transform: translateY(-1px);
}

.button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.queue-overlay {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  backdrop-filter: blur(12px);
  background: rgba(15, 23, 42, 0.55);
}

.queue-panel {
  width: min(100%, 460px);
  border-radius: 28px;
  border: 2px solid rgba(255, 255, 255, 0.75);
  background: rgba(255, 255, 255, 0.96);
  padding: 2.4rem 2rem;
  display: grid;
  gap: 1.25rem;
  text-align: center;
  box-shadow: 0 32px 70px rgba(15, 23, 42, 0.25);
  position: relative;
}

.queue-spinner {
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  margin: 0 auto;
}

.queue-spinner__dot {
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  background: linear-gradient(135deg, #58cc02, #2ea024);
  animation: queue-bounce 1.2s ease-in-out infinite;
}

.queue-spinner__dot--two {
  animation-delay: 0.2s;
}

.queue-spinner__dot--three {
  animation-delay: 0.4s;
}

.queue-eyebrow {
  font-size: 0.7rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #94a3b8;
  font-weight: 700;
}

.queue-panel h2 {
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f172a;
}

.queue-note {
  font-size: 0.95rem;
  color: #475569;
}

.queue-tips {
  text-align: left;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(241, 245, 249, 0.85);
  padding: 1rem 1.3rem;
  color: #475569;
  font-size: 0.9rem;
}

.queue-tips ul {
  margin: 0.75rem 0 0;
  padding-left: 1.2rem;
  display: grid;
  gap: 0.5rem;
  list-style: disc;
}

.queue-cancel {
  justify-self: center;
  padding: 0.75rem 2.4rem;
  border-radius: 9999px;
  border: none;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: #ffffff;
  background: #f43f5e;
  box-shadow: 0 18px 36px rgba(244, 63, 94, 0.25);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.queue-cancel:hover {
  transform: translateY(-2px);
  box-shadow: 0 24px 48px rgba(244, 63, 94, 0.28);
}

.lobby-card--dim {
  filter: blur(4px);
  pointer-events: none;
  user-select: none;
}

.opponent-overlay {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  background: rgba(241, 245, 249, 0.75);
}

.opponent-panel {
  width: min(100%, 500px);
  border-radius: 30px;
  border: 2px solid rgba(148, 163, 184, 0.35);
  background: rgba(255, 255, 255, 0.97);
  padding: 2.6rem 2.2rem;
  display: grid;
  gap: 1.4rem;
  text-align: center;
  color: #0f172a;
  box-shadow: 0 30px 70px rgba(148, 163, 184, 0.35);
  position: relative;
}

.opponent-icon {
  position: relative;
  width: 88px;
  height: 88px;
  margin: 0 auto;
}

.opponent-icon__wave {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  border: 2px solid rgba(59, 130, 246, 0.25);
  animation: opponent-ripple 2.6s ease-out infinite;
}

.opponent-icon__wave--delay {
  animation-delay: 1.3s;
}

.opponent-icon__avatar {
  position: absolute;
  inset: 14px;
  border-radius: 9999px;
  background: linear-gradient(135deg, #60a5fa, #2563eb);
  color: #fff;
  font-size: 2rem;
  font-weight: 800;
  display: grid;
  place-items: center;
  box-shadow: 0 12px 30px rgba(96, 165, 250, 0.4);
}

.opponent-eyebrow {
  font-size: 0.7rem;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: #94a3b8;
  font-weight: 700;
}

.opponent-panel h2 {
  font-size: 1.75rem;
  font-weight: 800;
  color: #0f172a;
}

.opponent-note {
  font-size: 0.95rem;
  color: #475569;
}

.opponent-actions {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  justify-content: center;
}

@media (min-width: 640px) {
  .opponent-actions {
    flex-direction: row;
  }
}

.opponent-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border-radius: 9999px;
  padding: 0.85rem 2.4rem;
  font-size: 0.85rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.opponent-button--primary {
  background: linear-gradient(135deg, #22c55e, #15803d);
  color: #ffffff;
  box-shadow: 0 18px 40px rgba(34, 197, 94, 0.35);
}

.opponent-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 26px 55px rgba(34, 197, 94, 0.42);
}

.opponent-button--ghost {
  background: rgba(148, 163, 184, 0.12);
  color: #1f2937;
  border: 1px solid rgba(148, 163, 184, 0.45);
  box-shadow: 0 12px 30px rgba(148, 163, 184, 0.25);
}

.opponent-button--ghost:hover {
  transform: translateY(-2px);
}

.lobby-grid {
  display: grid;
  gap: 1.5rem;
  width: min(100%, 980px);
  z-index: 1;
}

.lobby-grid--blur {
  filter: blur(8px);
  pointer-events: none;
  user-select: none;
}

@media (min-width: 768px) {
  .lobby-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.info-tile {
  border-radius: 24px;
  padding: 1.9rem;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
  display: grid;
  gap: 1.25rem;
}

.info-tile header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.info-avatar {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: rgba(88, 204, 2, 0.14);
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.info-avatar--blue {
  background: rgba(28, 176, 246, 0.14);
}

.info-title {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.info-sub {
  font-size: 0.9rem;
  color: #475569;
}

.info-tile ul,
.info-tile ol {
  margin: 0;
  padding-left: 1.2rem;
  display: grid;
  gap: 0.65rem;
  color: #4b5563;
  font-size: 0.95rem;
}

.info-tile ul {
  list-style: disc;
}

.info-tile ol {
  list-style: decimal;
}

.queue-enter-active,
.queue-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.queue-enter-from,
.queue-leave-to {
  opacity: 0;
  transform: scale(0.97);
}

.opponent-enter-active,
.opponent-leave-active {
  transition: opacity 0.28s ease, transform 0.28s ease;
}

.opponent-enter-from,
.opponent-leave-to {
  opacity: 0;
  transform: scale(0.97);
}

@keyframes queue-bounce {
  0%, 80%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  40% {
    transform: translateY(-12px);
    opacity: 1;
  }
}

@keyframes opponent-ripple {
  0% {
    transform: scale(0.6);
    opacity: 0.6;
  }
  70% {
    transform: scale(1.4);
    opacity: 0;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}
</style>


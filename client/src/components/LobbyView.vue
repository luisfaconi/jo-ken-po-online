<template>
  <div class="lobby">
    <div class="lobby__orb lobby__orb--one"></div>
    <div class="lobby__orb lobby__orb--two"></div>

    <section class="lobby-card">
      <div class="lobby-card__head">
        <span class="lobby-badge">Hall principal</span>
        <h1>Pronto para o proximo duelo?</h1>
        <p>
          Entre na fila e deixe o sistema encontrar automaticamente um adversario. Assim que o
          pareamento ocorrer, voce sera levado para uma sala dedicada.
        </p>
      </div>

      <div class="lobby-card__body">
        <div class="lobby-card__stat">
          <span class="stat-label">Salas em jogo</span>
          <span class="stat-value">
            {{ state.roomsOnline }}
            <small>ao vivo</small>
          </span>
        </div>
        <div class="lobby-card__actions">
          <button class="button button--primary" :disabled="!canJoin" @click="$emit('join')">
            {{ joinLabel }}
          </button>
          <button class="button button--ghost" :disabled="!canCancel" @click="$emit('cancel')">
            Cancelar
          </button>
        </div>
      </div>
    </section>

    <section class="lobby-grid">
      <article class="info-tile">
        <header>
          <span class="info-avatar">ST</span>
          <div>
            <p class="info-title">Status</p>
            <p class="info-sub">{{ statusText }}</p>
          </div>
        </header>
        <ul>
          <li>Fila atual: {{ state.queueSize }} jogador{{ state.queueSize === 1 ? '' : 'es' }} aguardando.</li>
          <li>Aguarde na fila enquanto encontramos outro jogador.</li>
          <li>Assim que a sala abrir, voce segue direto para a arena.</li>
        </ul>
      </article>

      <article class="info-tile">
        <header>
          <span class="info-avatar info-avatar--blue">HOW</span>
          <div>
            <p class="info-title">Como funciona</p>
            <p class="info-sub">Partidas melhor de 5</p>
          </div>
        </header>
        <ol>
          <li>Entre na fila e aguarde o pareamento.</li>
          <li>Escolha Pedra, Papel ou Tesoura assim que a rodada abrir.</li>
          <li>Quem fizer 3 pontos primeiro vence a partida.</li>
        </ol>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { GameState } from '../composables/useGame';

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
}>();
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
  z-index: 1;
}

.lobby-card__head {
  padding: 3rem 3rem 1.75rem;
  display: grid;
  gap: 0.8rem;
}

.lobby-card__head h1 {
  font-size: 2rem;
  color: #183153;
  font-weight: 700;
}

.lobby-card__head p {
  color: #475569;
  font-size: 1rem;
}

.lobby-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 1rem;
  border-radius: 9999px;
  background: rgba(24, 201, 90, 0.18);
  border: 1px solid rgba(24, 201, 90, 0.35);
  font-size: 0.75rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  font-weight: 600;
  color: #2b7d19;
}

.lobby-card__body {
  padding: 1.75rem 3rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.lobby-card__stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-radius: 18px;
  background: rgba(28, 176, 246, 0.1);
  border: 1px solid rgba(28, 176, 246, 0.2);
}

.stat-label {
  font-size: 0.75rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  font-weight: 600;
  color: #1d4ed8;
}

.stat-value {
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
}

.stat-value small {
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #2563eb;
  font-weight: 600;
}

.lobby-card__actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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

.lobby-grid {
  display: grid;
  gap: 1.5rem;
  width: min(100%, 980px);
  z-index: 1;
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
</style>

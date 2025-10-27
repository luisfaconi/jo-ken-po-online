<template>
  <div class="round-modal__backdrop">
    <div class="round-modal__card" :class="cardClass">
      <span class="round-modal__eyebrow">{{ t('common.round', { round: summary.round }) }}</span>
      <span class="round-modal__badge">{{ copy.badge }}</span>
      <h2 class="round-modal__title">{{ copy.title }}</h2>
      <p class="round-modal__matchup" v-html="youPlayedHtml"></p>
      <div class="round-modal__scoreboard">
        <div>
          <span class="round-modal__score-label">{{ scoreboardLabels.you }}</span>
          <span class="round-modal__score-value">{{ summary.you.score }}</span>
        </div>
        <div class="round-modal__score-divider">x</div>
        <div>
          <span class="round-modal__score-label">{{ scoreboardLabels.opponent }}</span>
          <span class="round-modal__score-value">{{ summary.opponent.score }}</span>
        </div>
      </div>
      <p class="round-modal__note">{{ copy.note }}</p>
      <button type="button" class="round-modal__button" @click="emit('close')">
        {{ copy.action }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { RoundSummary } from '../composables/useGame';
import { useI18n, translateChoiceLabel } from '../i18n';

const props = defineProps<{
  summary: RoundSummary;
  pointsToWin: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const { t } = useI18n();

const cardClass = computed(() => {
  switch (props.summary.result) {
    case 'win':
      return 'round-modal__card--win';
    case 'lose':
      return 'round-modal__card--lose';
    case 'draw':
      return 'round-modal__card--draw';
    default:
      return '';
  }
});

const scoreboardLabels = computed(() => ({
  you: t('roundSummary.scoreboard.you'),
  opponent: t('roundSummary.scoreboard.opponent')
}));

const youPlayedHtml = computed(() =>
  t('roundSummary.youPlayed', {
    you: translateChoiceLabel(props.summary.you.choice),
    opponent: translateChoiceLabel(props.summary.opponent.choice)
  })
);

const copy = computed(() => {
  const pointsRemainingForYou = Math.max(props.pointsToWin - props.summary.you.score, 0);
  const pointsRemainingForOpponent = Math.max(props.pointsToWin - props.summary.opponent.score, 0);

  if (props.summary.result === 'win') {
    const note =
      pointsRemainingForYou === 0
        ? t('roundSummary.win.noteFinish')
        : pointsRemainingForYou === 1
          ? t('roundSummary.win.noteOnePoint')
          : t('roundSummary.win.noteMany', { count: pointsRemainingForYou });

    return {
      badge: t('roundSummary.win.badge'),
      title: t('roundSummary.win.title'),
      note,
      action:
        pointsRemainingForYou === 0
          ? t('roundSummary.win.actionMatchPoint')
          : t('roundSummary.win.actionContinue')
    };
  }

  if (props.summary.result === 'lose') {
    let note: string;

    if (pointsRemainingForOpponent === 0) {
      note = t('roundSummary.lose.noteMatchPoint');
    } else if (pointsRemainingForYou <= 0) {
      note = t('roundSummary.lose.noteKeepAlive');
    } else {
      note = t('roundSummary.lose.noteDefault', { count: pointsRemainingForYou });
    }

    return {
      badge: t('roundSummary.lose.badge'),
      title: t('roundSummary.lose.title'),
      note,
      action: t('roundSummary.lose.action')
    };
  }

  if (props.summary.result === 'draw') {
    return {
      badge: t('roundSummary.draw.badge'),
      title: t('roundSummary.draw.title'),
      note: t('roundSummary.draw.note'),
      action: t('roundSummary.draw.action')
    };
  }

  return {
    badge: '',
    title: '',
    note: '',
    action: t('roundSummary.continue')
  };
});
</script>

<style scoped>
.round-modal__backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.55);
}

.round-modal__card {
  width: min(100%, 420px);
  border-radius: 28px;
  border: 2px solid rgba(226, 232, 240, 0.9);
  background: #ffffff;
  padding: 2.25rem 2rem;
  display: grid;
  gap: 1rem;
  text-align: center;
  box-shadow: 0 28px 66px rgba(15, 23, 42, 0.18);
  animation: pop-in 0.35s ease;
}

.round-modal__card--win {
  border-color: rgba(34, 197, 94, 0.45);
  box-shadow: 0 28px 66px rgba(34, 197, 94, 0.24);
}

.round-modal__card--lose {
  border-color: rgba(248, 113, 113, 0.45);
  box-shadow: 0 28px 66px rgba(248, 113, 113, 0.24);
}

.round-modal__card--draw {
  border-color: rgba(245, 158, 11, 0.45);
  box-shadow: 0 28px 66px rgba(245, 158, 11, 0.22);
}

.round-modal__eyebrow {
  font-size: 0.65rem;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: #94a3b8;
  font-weight: 600;
}

.round-modal__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  padding: 0.35rem 0.9rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  background: rgba(148, 163, 184, 0.18);
  color: #1f2937;
}

.round-modal__card--win .round-modal__badge {
  background: rgba(134, 239, 172, 0.25);
  color: #166534;
}

.round-modal__card--lose .round-modal__badge {
  background: rgba(254, 202, 202, 0.25);
  color: #7f1d1d;
}

.round-modal__card--draw .round-modal__badge {
  background: rgba(253, 230, 138, 0.25);
  color: #92400e;
}

.round-modal__title {
  font-size: 1.65rem;
  font-weight: 800;
  color: #0f172a;
}

.round-modal__matchup {
  font-size: 0.95rem;
  color: #475569;
}

.round-modal__scoreboard {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 1.2rem;
  padding: 0.9rem 1.2rem;
  border-radius: 18px;
  background: rgba(241, 245, 249, 0.85);
}

.round-modal__scoreboard > div {
  text-align: center;
}

.round-modal__score-label {
  display: block;
  font-size: 0.7rem;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 600;
}

.round-modal__score-value {
  display: block;
  font-size: 1.8rem;
  font-family: 'Press Start 2P', monospace;
  margin-top: 0.25rem;
  color: #0f172a;
}

.round-modal__score-divider {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1d4ed8;
}

.round-modal__note {
  font-size: 0.85rem;
  color: #475569;
}

.round-modal__button {
  justify-self: center;
  padding: 0.75rem 2.4rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: #ffffff;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  background: #2563eb;
  box-shadow: 0 18px 30px rgba(37, 99, 235, 0.28);
}

.round-modal__button:hover {
  transform: translateY(-2px);
  box-shadow: 0 24px 40px rgba(37, 99, 235, 0.32);
}

.round-modal__card--win .round-modal__button {
  background: #22c55e;
  box-shadow: 0 18px 30px rgba(34, 197, 94, 0.28);
}

.round-modal__card--win .round-modal__button:hover {
  box-shadow: 0 24px 40px rgba(34, 197, 94, 0.32);
}

.round-modal__card--lose .round-modal__button {
  background: #f43f5e;
  box-shadow: 0 18px 30px rgba(244, 63, 94, 0.28);
}

.round-modal__card--lose .round-modal__button:hover {
  box-shadow: 0 24px 40px rgba(244, 63, 94, 0.32);
}

.round-modal__card--draw .round-modal__button {
  background: #f59e0b;
  box-shadow: 0 18px 30px rgba(245, 158, 11, 0.28);
}

.round-modal__card--draw .round-modal__button:hover {
  box-shadow: 0 24px 40px rgba(245, 158, 11, 0.32);
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


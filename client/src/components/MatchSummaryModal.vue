<template>
  <div class="match-modal__backdrop">
    <div class="match-card max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-2xl">
      <h2
        class="text-sm font-semibold uppercase tracking-[0.4em]"
        :class="summary.you.didWin ? 'text-green-600' : 'text-rose-600'"
      >
        {{ summary.you.didWin ? 'Vitoria!' : 'Derrota' }}
      </h2>
      <p class="mt-3 text-sm text-slate-600">
        Placar final: Voce {{ summary.you.score }} x
        {{ summary.opponent?.score ?? 0 }} Oponente
      </p>
      <p class="mt-1 text-xs text-slate-500">
        Melhor de {{ summary.bestOf }} - retornando ao saguao em instantes...
      </p>
      <button
        type="button"
        class="mt-5 rounded-full bg-blue-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white shadow-lg transition hover:bg-blue-600"
        @click="$emit('close')"
      >
        Voltar agora
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MatchSummary } from '../composables/useGame';

defineProps<{
  summary: MatchSummary;
}>();

defineEmits<{
  (e: 'close'): void;
}>();
</script>

<style scoped>
.match-modal__backdrop {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.4);
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


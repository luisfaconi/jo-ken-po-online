<template>
  <label class="language-switcher">
    <span class="language-switcher__label">{{ t('language.label') }}</span>
    <select class="language-switcher__select" :value="locale" @change="onChange">
      <option v-for="item in locales" :key="item.code" :value="item.code">
        {{ item.label }}
      </option>
    </select>
  </label>
</template>

<script setup lang="ts">
import { useI18n, type LocaleCode } from '../i18n';

const { locale, availableLocales, setLocale, t } = useI18n();

const locales = availableLocales;

function onChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  const value = target.value as LocaleCode;
  setLocale(value);
}
</script>

<style scoped>
.language-switcher {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.35);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.12);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.language-switcher__label {
  color: #475569;
}

.language-switcher__select {
  border: none;
  background: transparent;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #1f2937;
  cursor: pointer;
  outline: none;
}

.language-switcher__select option {
  color: #1f2937;
}
</style>

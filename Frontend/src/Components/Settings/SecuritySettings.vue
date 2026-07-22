<template>
  <section class="settings-panel">
    <div class="panel-heading"><h2>{{ t.title }}</h2><p>{{ t.subtitle }}</p></div>
    <div class="form-grid">
      <label>{{ t.session }}<select><option>{{ t.hours8 }}</option><option>{{ t.hours4 }}</option><option>{{ t.hours24 }}</option></select></label>
      <label>{{ t.passwordMin }}<input type="number" value="8" /></label>
      <label>{{ t.lockAfter }}<input type="number" value="5" /></label>
      <label>{{ t.passwordPolicy }}<select><option>{{ t.strong }}</option><option>{{ t.medium }}</option></select></label>
    </div>
    <label class="single-toggle"><span>{{ t.twoFactor }}</span><input type="checkbox" /></label>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useLanguageStore } from '@/stores/language'
const languageStore = useLanguageStore()
const t = computed(() => ({
  FR: { title: 'Securite', subtitle: 'Sessions, authentification et politique de mots de passe.', session: 'Duree session', hours8: '8 heures', hours4: '4 heures', hours24: '24 heures', passwordMin: 'Mot de passe minimum', lockAfter: 'Verrouillage apres X tentatives', passwordPolicy: 'Politique mot de passe', strong: 'Forte', medium: 'Moyenne', twoFactor: 'Double authentification' },
  EN: { title: 'Security', subtitle: 'Sessions, authentication, and password policy.', session: 'Session duration', hours8: '8 hours', hours4: '4 hours', hours24: '24 hours', passwordMin: 'Minimum password length', lockAfter: 'Lock after X attempts', passwordPolicy: 'Password policy', strong: 'Strong', medium: 'Medium', twoFactor: 'Two-factor authentication' },
  AR: { title: 'الأمان', subtitle: 'الجلسات، المصادقة وسياسة كلمات المرور.', session: 'مدة الجلسة', hours8: '8 ساعات', hours4: '4 ساعات', hours24: '24 ساعة', passwordMin: 'الحد الأدنى لكلمة المرور', lockAfter: 'القفل بعد عدد محاولات', passwordPolicy: 'سياسة كلمة المرور', strong: 'قوية', medium: 'متوسطة', twoFactor: 'المصادقة الثنائية' },
})[languageStore.language] || {})
</script>

<style scoped>
@import './settings.css';
.single-toggle { display: flex; justify-content: space-between; gap: 12px; margin-top: 16px; padding: 15px; border: 1px solid rgba(126, 146, 170, 0.24); border-radius: 8px; background: rgba(13, 21, 32, 0.82); color: #f4f7fb; font-weight: 900; }
.single-toggle input { width: 18px; height: 18px; accent-color: #83b95c; }
</style>

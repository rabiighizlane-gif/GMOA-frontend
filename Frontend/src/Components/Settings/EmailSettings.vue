<template>
  <section class="settings-panel" :dir="pageDirection">
    <div class="panel-heading">
      <h2>{{ t.title }}</h2>
      <p>{{ t.subtitle }}</p>
    </div>

    <div class="form-grid">
      <label>
        <span>{{ t.host }}</span>
        <input value="smtp.smartcalyx.ma" dir="ltr" />
      </label>

      <label>
        <span>{{ t.port }}</span>
        <input type="number" value="587" dir="ltr" />
      </label>

      <label>
        <span>{{ t.username }}</span>
        <input value="notifications@smartcalyx.ma" dir="ltr" />
      </label>

      <label>
        <span>{{ t.password }}</span>
        <input type="password" value="smartcalyx" dir="ltr" />
      </label>

      <label>
        <span>{{ t.ssl }}</span>
        <select>
          <option>{{ t.enabled }}</option>
          <option>{{ t.disabled }}</option>
        </select>
      </label>
    </div>

    <button type="button" class="primary-action">{{ t.test }}</button>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()
const pageDirection = computed(() => (languageStore.language === 'AR' ? 'rtl' : 'ltr'))

const labels = {
  FR: {
    title: 'Email & SMTP',
    subtitle: "Configuration du serveur d'envoi des notifications email.",
    host: 'Hote',
    port: 'Port',
    username: "Nom d'utilisateur",
    password: 'Mot de passe',
    ssl: 'SSL',
    enabled: 'Active',
    disabled: 'Desactive',
    test: "Tester l'envoi",
  },
  EN: {
    title: 'Email & SMTP',
    subtitle: 'Outgoing email notification server configuration.',
    host: 'Host',
    port: 'Port',
    username: 'Username',
    password: 'Password',
    ssl: 'SSL',
    enabled: 'Enabled',
    disabled: 'Disabled',
    test: 'Test sending',
  },
  AR: {
    title: 'البريد و SMTP',
    subtitle: 'إعداد خادم إرسال إشعارات البريد الإلكتروني.',
    host: 'الخادم',
    port: 'المنفذ',
    username: 'اسم المستخدم',
    password: 'كلمة المرور',
    ssl: 'تشفير SSL',
    enabled: 'مفعل',
    disabled: 'معطل',
    test: 'اختبار الإرسال',
  },
}

const t = computed(() => labels[languageStore.language] || labels.FR)
</script>

<style scoped>
@import './settings.css';

.settings-panel[dir='rtl'] .panel-heading,
.settings-panel[dir='rtl'] .form-grid label {
  text-align: right;
}

.settings-panel[dir='rtl'] .primary-action {
  display: block;
  margin-right: auto;
  margin-left: 0;
}
</style>

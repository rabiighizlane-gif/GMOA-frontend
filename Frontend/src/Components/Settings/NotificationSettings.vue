<template>
  <section class="settings-panel">
    <div class="panel-heading">
      <h2>Notifications</h2>
      <p>Canaux et événements déclencheurs des alertes SmartCalyx.</p>
    </div>

    <div class="toggle-grid">
      <label v-for="item in items" :key="item"><span>{{ item }}</span><input checked type="checkbox" /></label>
    </div>
  </section>
</template>

<script setup>
const items = ['Email', 'Application', 'Maintenance prévue', 'Nouvelle panne', 'Demande maintenance', 'Stock faible', 'Intervention terminée']
</script>

<style scoped>
@import './settings.css';
.toggle-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.toggle-grid label { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 15px; border: 1px solid #edf0e8; border-radius: 14px; background: #fbfcf8; color: #4a0a0a; font-weight: 900; }
.toggle-grid input { width: 18px; height: 18px; accent-color: #6a9a2a; }
@media (max-width: 760px) { .toggle-grid { grid-template-columns: 1fr; } }
</style>

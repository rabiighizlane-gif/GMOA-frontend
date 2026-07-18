<template>
  <section class="settings-panel">
    <div class="panel-heading">
      <h2>Système</h2>
      <p>État technique de la plateforme et informations d'exploitation.</p>
    </div>

    <div class="system-grid">
      <article v-for="item in items" :key="item.label">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </article>
    </div>
  </section>
</template>

<script setup>
const items = [
  { label: 'Version SmartCalyx', value: '1.0.0' },
  { label: 'Version API', value: 'v1' },
  { label: 'Base de données', value: 'PostgreSQL' },
  { label: 'Serveur', value: 'Production' },
  { label: 'Dernière sauvegarde', value: '18/07/2026 03:00' },
  { label: 'Espace disque', value: '68 % utilisé' },
  { label: 'Utilisateurs actifs', value: '24' },
]
</script>

<style scoped>
@import './settings.css';
.system-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.system-grid article { padding: 16px; border: 1px solid #edf0e8; border-radius: 16px; background: #fbfcf8; }
.system-grid span { display: block; color: #64748b; font-size: 11px; font-weight: 900; text-transform: uppercase; }
.system-grid strong { display: block; margin-top: 8px; color: #4a0a0a; font-size: 17px; font-weight: 950; }
@media (max-width: 900px) { .system-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 620px) { .system-grid { grid-template-columns: 1fr; } }
</style>

<template>
  <section class="settings-panel">
    <div class="panel-heading">
      <h2>Sauvegardes</h2>
      <p>Planification, téléchargement et restauration des backups.</p>
    </div>

    <label class="single-toggle"><span>Sauvegarde automatique</span><input checked type="checkbox" /></label>
    <div class="form-grid compact">
      <label>Tous les<select><option>Jour</option><option>Semaine</option><option>Mois</option></select></label>
    </div>

    <div class="button-row">
      <button class="primary-action" type="button">Créer sauvegarde</button>
      <button type="button">Télécharger</button>
      <button type="button">Restaurer</button>
    </div>
  </section>
</template>

<style scoped>
@import './settings.css';
.single-toggle { display: flex; justify-content: space-between; gap: 12px; padding: 15px; border: 1px solid #edf0e8; border-radius: 14px; background: #fbfcf8; color: #4a0a0a; font-weight: 900; }
.single-toggle input { width: 18px; height: 18px; accent-color: #6a9a2a; }
.compact { margin-top: 16px; grid-template-columns: minmax(220px, 360px); }
.button-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
.button-row button { min-height: 42px; padding: 0 14px; border: 1px solid #dfe5d6; border-radius: 12px; background: white; color: #4a0a0a; font-weight: 900; }
</style>

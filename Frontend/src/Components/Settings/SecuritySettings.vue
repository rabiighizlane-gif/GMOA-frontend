<template>
  <section class="settings-panel">
    <div class="panel-heading">
      <h2>Sécurité</h2>
      <p>Sessions, authentification et politique de mots de passe.</p>
    </div>

    <div class="form-grid">
      <label>Durée session<select><option>8 heures</option><option>4 heures</option><option>24 heures</option></select></label>
      <label>Mot de passe minimum<input type="number" value="8" /></label>
      <label>Verrouillage après X tentatives<input type="number" value="5" /></label>
      <label>Politique mot de passe<select><option>Forte</option><option>Moyenne</option></select></label>
    </div>

    <label class="single-toggle"><span>Double authentification</span><input type="checkbox" /></label>
  </section>
</template>

<style scoped>
@import './settings.css';
.single-toggle { display: flex; justify-content: space-between; gap: 12px; margin-top: 16px; padding: 15px; border: 1px solid #edf0e8; border-radius: 14px; background: #fbfcf8; color: #4a0a0a; font-weight: 900; }
.single-toggle input { width: 18px; height: 18px; accent-color: #6a9a2a; }
</style>

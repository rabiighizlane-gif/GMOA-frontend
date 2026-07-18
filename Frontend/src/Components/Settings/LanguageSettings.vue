<template>
  <section class="settings-panel">
    <div class="panel-heading">
      <h2>Langues & région</h2>
      <p>Langue d'interface, formats régionaux et présentation des données.</p>
    </div>

    <div class="choice-row">
      <button class="active" type="button">Français</button>
      <button type="button">English</button>
      <button type="button">العربية</button>
    </div>

    <div class="form-grid">
      <label>Format date<select><option>18/07/2026</option><option>2026-07-18</option></select></label>
      <label>Format heure<select><option>24h - 20:55</option><option>12h - 08:55 PM</option></select></label>
      <label>Format devise<select><option>48 600 DH</option><option>MAD 48,600</option></select></label>
    </div>
  </section>
</template>

<style scoped>
@import './settings.css';
.choice-row { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 18px; }
.choice-row button { min-height: 42px; padding: 0 16px; border-radius: 12px; border: 1px solid #dfe5d6; background: white; color: #4a0a0a; font-weight: 900; }
.choice-row button.active { border-color: #b6c65b; background: #eef5df; color: #6a9a2a; }
</style>

<template>
  <section class="settings-panel">
    <div class="panel-heading">
      <h2>Apparence</h2>
      <p>Thème visuel, couleur principale, typographie et logo.</p>
    </div>

    <div class="choice-row">
      <button class="active" type="button">Mode clair</button>
      <button type="button">Mode sombre</button>
    </div>

    <div class="form-grid">
      <label>Couleur principale<input type="color" value="#6a9a2a" /></label>
      <label>Taille police<select><option>Standard</option><option>Large</option><option>Compacte</option></select></label>
      <label>Logo<input value="logo-smartcalyx.png" /></label>
    </div>
  </section>
</template>

<style scoped>
@import './settings.css';
.choice-row { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 18px; }
.choice-row button { min-height: 42px; padding: 0 16px; border-radius: 12px; border: 1px solid #dfe5d6; background: white; color: #4a0a0a; font-weight: 900; }
.choice-row button.active { border-color: #b6c65b; background: #eef5df; color: #6a9a2a; }
input[type='color'] { padding: 5px; }
</style>

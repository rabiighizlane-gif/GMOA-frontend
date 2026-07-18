<template>
  <section class="settings-panel">
    <div class="panel-heading">
      <h2>Email & SMTP</h2>
      <p>Configuration du serveur d'envoi des notifications email.</p>
    </div>

    <div class="form-grid">
      <label>Host<input value="smtp.smartcalyx.ma" /></label>
      <label>Port<input type="number" value="587" /></label>
      <label>Username<input value="notifications@smartcalyx.ma" /></label>
      <label>Password<input type="password" value="smartcalyx" /></label>
      <label>SSL<select><option>Activé</option><option>Désactivé</option></select></label>
    </div>

    <button type="button" class="primary-action">Tester l'envoi</button>
  </section>
</template>

<style scoped>
@import './settings.css';
</style>

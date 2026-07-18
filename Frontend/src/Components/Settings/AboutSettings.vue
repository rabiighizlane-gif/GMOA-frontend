<template>
  <section class="settings-panel about-panel">
    <div class="brand-mark">
      <img :src="logo" alt="SmartCalyx" />
    </div>
    <h2>SmartCalyx</h2>
    <p>Application GMAO dédiée à AGRO-FOOD INDUSTRIE Marrakech</p>

    <dl>
      <div><dt>Version</dt><dd>SmartCalyx 1.0</dd></div>
      <div><dt>Domaine</dt><dd>Producteur agroalimentaire</dd></div>
      <div><dt>Entreprise</dt><dd>AGRO-FOOD INDUSTRIE Marrakech</dd></div>
      <div><dt>Adresse</dt><dd>102 Rte de Safi, Marrakech 40110</dd></div>
      <div><dt>Modules</dt><dd>Pannes, interventions, stock, rapports</dd></div>
      <div><dt>Site web</dt><dd>agrofoodindustrie.com</dd></div>
      <div><dt>Téléphone</dt><dd>05 24 33 80 80</dd></div>
      <div><dt>Environnement</dt><dd>GMAO agroalimentaire</dd></div>
      <div><dt>Année</dt><dd>2026</dd></div>
    </dl>
  </section>
</template>

<script setup>
const logo = '/Profiles/agoo-logo.png'
</script>

<style scoped>
@import './settings.css';
.about-panel { text-align: center; }
.brand-mark { width: 132px; height: 132px; display: grid; place-items: center; margin: 0 auto 18px; border-radius: 28px; background: #edf5de; overflow: hidden; }
.brand-mark img { width: 100%; height: 100%; object-fit: contain; padding: 14px; }
.about-panel h2 { margin: 0; color: #111827; font-size: 30px; font-weight: 950; }
.about-panel p { margin: 8px 0 24px; color: #64748b; font-weight: 850; }
dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin: 0; text-align: left; }
dl div { padding: 15px; border: 1px solid #edf0e8; border-radius: 14px; background: #fbfcf8; }
dt { color: #64748b; font-size: 11px; font-weight: 900; text-transform: uppercase; }
dd { margin: 6px 0 0; color: #4a0a0a; font-weight: 950; }
@media (max-width: 620px) { dl { grid-template-columns: 1fr; } }
</style>

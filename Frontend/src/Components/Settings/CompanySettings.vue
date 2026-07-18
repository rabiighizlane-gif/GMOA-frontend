<template>
  <section class="settings-panel">
    <div class="panel-heading">
      <h2>Entreprise</h2>
      <p>Identité de l'application GMAO dédiée à AGRO-FOOD INDUSTRIE Marrakech.</p>
    </div>

    <div class="logo-row">
      <div class="logo-box">
        <img :src="logoPreview" alt="Logo AGRO-FOOD INDUSTRIE Marrakech" />
      </div>
      <input ref="fileInput" class="logo-input" type="file" accept="image/*" @change="changeLogo" />
      <button type="button" @click="fileInput?.click()">Changer le logo</button>
    </div>

    <div class="form-grid">
      <label>Nom entreprise<input value="AGRO-FOOD INDUSTRIE Marrakech" /></label>
      <label>Adresse<input value="102 Rte de Safi, Marrakech 40110" /></label>
      <label>Téléphone<input value="05 24 33 80 80" /></label>
      <label>Email<input value="contact@agrofoodindustrie.com" /></label>
      <label>Site web<input value="agrofoodindustrie.com" /></label>
      <label>Fuseau horaire<select><option>Africa/Casablanca</option></select></label>
      <label>Devise<select><option>Dirham marocain - DH</option></select></label>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const fileInput = ref(null)
const defaultLogo = '/Profiles/agoo-logo.png'
const logoPreview = ref(defaultLogo)

function changeLogo(event) {
  const file = event.target.files?.[0]
  if (!file) return

  if (logoPreview.value !== defaultLogo) {
    URL.revokeObjectURL(logoPreview.value)
  }

  logoPreview.value = URL.createObjectURL(file)
}
</script>

<style scoped>
@import './settings.css';
.logo-row { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
.logo-box { width: 72px; height: 72px; display: grid; place-items: center; overflow: hidden; border-radius: 18px; background: #edf5de; color: #6a9a2a; font-size: 24px; font-weight: 950; }
.logo-box img { width: 100%; height: 100%; object-fit: contain; padding: 8px; }
.logo-input { display: none; }
.logo-row button { min-height: 42px; padding: 0 14px; border: 1px solid #dfe5d6; border-radius: 12px; background: white; color: #4a0a0a; font-weight: 900; }
</style>

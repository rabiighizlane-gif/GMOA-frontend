<template>
  <section class="settings-panel">
    <div class="panel-heading">
      <h2>{{ content.title }}</h2>
      <p>{{ content.subtitle }}</p>
    </div>

    <div class="logo-row">
      <div class="logo-box">
        <img :src="logoPreview" alt="Logo AGRO-FOOD INDUSTRIE Marrakech" />
      </div>
      <input ref="fileInput" class="logo-input" type="file" accept="image/*" @change="changeLogo" />
      <button type="button" @click="fileInput?.click()">{{ content.changeLogo }}</button>
    </div>

    <div class="form-grid">
      <label>{{ content.companyName }}<input :value="content.companyValue" /></label>
      <label>{{ content.address }}<input :value="content.addressValue" :dir="languageStore.language === 'AR' ? 'rtl' : 'ltr'" /></label>
      <label>{{ content.phone }}<input value="05 24 33 80 80" /></label>
      <label>{{ content.email }}<input value="contact@agrofoodindustrie.com" /></label>
      <label>{{ content.website }}<input value="agrofoodindustrie.com" /></label>
      <label>{{ content.timezone }}<select><option>Africa/Casablanca</option></select></label>
      <label>{{ content.currency }}<select><option>{{ content.dirham }}</option></select></label>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()
const fileInput = ref(null)
const defaultLogo = '/Profiles/agoo-logo.png'
const logoPreview = ref(defaultLogo)

const content = computed(() => ({
  FR: {
    title: 'Entreprise',
    subtitle: "Identite de l'application GMAO dediee a AGRO-FOOD INDUSTRIE Marrakech.",
    changeLogo: 'Changer le logo',
    companyName: 'Nom entreprise',
    address: 'Adresse',
    phone: 'Telephone',
    email: 'Email',
    website: 'Site web',
    timezone: 'Fuseau horaire',
    currency: 'Devise',
    dirham: 'Dirham marocain - DH',
    companyValue: 'AGRO-FOOD INDUSTRIE Marrakech',
    addressValue: '102 Rte de Safi, Marrakech 40110',
  },
  EN: {
    title: 'Company',
    subtitle: 'CMMS application identity for AGRO-FOOD INDUSTRIE Marrakech.',
    changeLogo: 'Change logo',
    companyName: 'Company name',
    address: 'Address',
    phone: 'Phone',
    email: 'Email',
    website: 'Website',
    timezone: 'Time zone',
    currency: 'Currency',
    dirham: 'Moroccan dirham - DH',
    companyValue: 'AGRO-FOOD INDUSTRIE Marrakech',
    addressValue: '102 Rte de Safi, Marrakech 40110',
  },
  AR: {
    title: 'الشركة',
    subtitle: 'هوية تطبيق إدارة الصيانة الخاص بـ AGRO-FOOD INDUSTRIE Marrakech.',
    changeLogo: 'تغيير الشعار',
    companyName: 'اسم الشركة',
    address: 'العنوان',
    phone: 'الهاتف',
    email: 'البريد الإلكتروني',
    website: 'الموقع الإلكتروني',
    timezone: 'المنطقة الزمنية',
    currency: 'العملة',
    dirham: 'الدرهم المغربي - DH',
    companyValue: 'AGRO-FOOD INDUSTRIE Marrakech',
    addressValue: '102 طريق آسفي، مراكش 40110',
  },
})[languageStore.language] || {})

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
.logo-row button { min-height: 42px; padding: 0 14px; border: 1px solid #dfe5d6; border-radius: 12px; background: white; color: #4a0a0a; font-weight: 900; cursor: pointer; }
</style>

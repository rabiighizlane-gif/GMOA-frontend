<template>
  <section class="settings-panel about-panel">
    <div class="brand-mark"><img :src="logo" alt="SmartCalyx" /></div>
    <h2>SmartCalyx</h2>
    <p>{{ t.subtitle }}</p>
    <dl>
      <div v-for="item in items" :key="item.label"><dt>{{ item.label }}</dt><dd>{{ item.value }}</dd></div>
    </dl>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useLanguageStore } from '@/stores/language'
const logo = '/Profiles/agoo-logo.png'
const languageStore = useLanguageStore()
const t = computed(() => ({
  FR: { subtitle: 'Application GMAO dediee a AGRO-FOOD INDUSTRIE Marrakech', labels: ['Version', 'Domaine', 'Entreprise', 'Adresse', 'Modules', 'Site web', 'Telephone', 'Environnement', 'Annee'], domain: 'Producteur agroalimentaire', modules: 'Pannes, interventions, stock, rapports', environment: 'GMAO agroalimentaire' },
  EN: { subtitle: 'CMMS application dedicated to AGRO-FOOD INDUSTRIE Marrakech', labels: ['Version', 'Domain', 'Company', 'Address', 'Modules', 'Website', 'Phone', 'Environment', 'Year'], domain: 'Agri-food producer', modules: 'Breakdowns, interventions, stock, reports', environment: 'Agri-food CMMS' },
  AR: { subtitle: 'تطبيق إدارة صيانة خاص بـ AGRO-FOOD INDUSTRIE Marrakech', labels: ['الإصدار', 'المجال', 'الشركة', 'العنوان', 'الوحدات', 'الموقع', 'الهاتف', 'البيئة', 'السنة'], domain: 'منتج غذائي صناعي', modules: 'الأعطال، التدخلات، المخزون، التقارير', environment: 'إدارة صيانة للصناعة الغذائية' },
})[languageStore.language] || {})
const items = computed(() => {
  const values = ['SmartCalyx 1.0', t.value.domain, 'AGRO-FOOD INDUSTRIE Marrakech', '102 Rte de Safi, Marrakech 40110', t.value.modules, 'agrofoodindustrie.com', '05 24 33 80 80', t.value.environment, '2026']
  return t.value.labels.map((label, index) => ({ label, value: values[index] }))
})
</script>

<style scoped>
@import './settings.css';
.about-panel { text-align: center; }
.brand-mark { width: 132px; height: 132px; display: grid; place-items: center; margin: 0 auto 18px; border-radius: 8px; background: rgba(131, 185, 92, 0.18); overflow: hidden; }
.brand-mark img { width: 100%; height: 100%; object-fit: contain; padding: 14px; }
.about-panel h2 { margin: 0; color: #f8fbff; font-size: 30px; font-weight: 950; }
.about-panel p { margin: 8px 0 24px; color: #8d9aab; font-weight: 850; }
dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin: 0; text-align: left; }
[dir='rtl'] dl { text-align: right; }
dl div { padding: 15px; border: 1px solid rgba(126, 146, 170, 0.24); border-radius: 8px; background: rgba(13, 21, 32, 0.82); }
dt { color: #aeb9c8; font-size: 11px; font-weight: 900; text-transform: uppercase; }
[dir='rtl'] dt { text-transform: none; }
dd { margin: 6px 0 0; color: #f8fbff; font-weight: 950; }
@media (max-width: 620px) { dl { grid-template-columns: 1fr; } }
</style>

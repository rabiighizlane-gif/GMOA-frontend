<template>
  <main class="analytics-layout" :dir="language === 'AR' ? 'rtl' : 'ltr'">
    <button
      type="button"
      class="sidebar-toggle"
      :class="{ 'is-hidden': isSidebarOpen }"
      :aria-label="content.sidebarToggle"
      :aria-expanded="isSidebarOpen"
      @click="toggleSidebar"
    >
      <span></span><span></span><span></span>
    </button>
    <div v-if="isSidebarOpen" class="sidebar-backdrop" @click="closeSidebar"></div>
    <Sidebar :open="isSidebarOpen" @close="closeSidebar" />

    <section class="analytics-page">
      <header class="page-header">
        <div>
          <p class="breadcrumb">{{ content.breadcrumb }}</p>
          <h1>{{ content.title }}</h1>
          <p>{{ content.subtitle }}</p>
        </div>
        <div class="live-pill"><span></span> {{ content.live }}</div>
      </header>

      <ReportsKPICards :cards="kpiCards" />

      <section class="health-strip">
        <article v-for="item in healthItems" :key="item.label">
          <span>{{ item.label }}</span>
          <strong :dir="item.direction">{{ item.value }}</strong>
          <small>{{ item.note }}</small>
        </article>
      </section>

      <div class="section-heading">
        <h2>{{ content.operationalTitle }}</h2>
        <p>{{ content.operationalSubtitle }}</p>
      </div>
      <ReportsChartsSection report-type="interventions" />

      <div class="section-heading">
        <h2>{{ content.machineHealthTitle }}</h2>
        <p>{{ content.machineHealthSubtitle }}</p>
      </div>
      <ReportsChartsSection report-type="machines" />

      <div class="section-heading">
        <h2>{{ content.preventiveTitle }}</h2>
        <p>{{ content.preventiveSubtitle }}</p>
      </div>
      <ReportsChartsSection report-type="preventive" />
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useLanguageStore } from '@/stores/language'
import ReportsChartsSection from '@/Components/Reports/ReportsChartsSection.vue'
import ReportsKPICards from '@/Components/Reports/ReportsKPICards.vue'
import Sidebar from '@/Components/sidebar.vue'

const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)
const isSidebarOpen = ref(false)

const pageContent = {
  FR: {
    sidebarToggle: 'Afficher le menu',
    breadcrumb: 'Accueil / KPI & Statistiques',
    title: 'KPI & Statistiques',
    subtitle: "Vue analytique live de la sante generale de l'usine.",
    live: 'Live',
    operationalTitle: 'Indicateurs operationnels',
    operationalSubtitle: 'Pannes, interventions, disponibilite et charge technique.',
    machineHealthTitle: 'Sante du parc machines',
    machineHealthSubtitle: 'Disponibilite par ligne et machines les plus instables.',
    preventiveTitle: 'Maintenance preventive',
    preventiveSubtitle: 'Respect du planning, frequence et retards.',
  },
  EN: {
    sidebarToggle: 'Show menu',
    breadcrumb: 'Home / KPIs & Statistics',
    title: 'KPIs & Statistics',
    subtitle: 'Live analytics view of the plant overall health.',
    live: 'Live',
    operationalTitle: 'Operational indicators',
    operationalSubtitle: 'Breakdowns, interventions, availability, and technical workload.',
    machineHealthTitle: 'Machine fleet health',
    machineHealthSubtitle: 'Availability by line and the least stable machines.',
    preventiveTitle: 'Preventive maintenance',
    preventiveSubtitle: 'Schedule compliance, frequency, and delays.',
  },
  AR: {
    sidebarToggle: 'إظهار القائمة',
    breadcrumb: 'الرئيسية / المؤشرات والإحصائيات',
    title: 'المؤشرات والإحصائيات',
    subtitle: 'عرض تحليلي مباشر للحالة العامة للمصنع.',
    live: 'مباشر',
    operationalTitle: 'المؤشرات التشغيلية',
    operationalSubtitle: 'الأعطال، التدخلات، التوفر والعبء التقني.',
    machineHealthTitle: 'حالة أسطول الآلات',
    machineHealthSubtitle: 'التوفر حسب الخط والآلات الأقل استقرارا.',
    preventiveTitle: 'الصيانة الوقائية',
    preventiveSubtitle: 'احترام التخطيط، التواتر والتأخيرات.',
  },
}

const content = computed(() => pageContent[language.value] || pageContent.FR)

const kpiCards = computed(() => {
  const labels = {
    FR: [
      ['Disponibilite globale', 'Objectif superieur a 90 %'],
      ['MTBF', 'Fiabilite moyenne'],
      ['MTTR', 'Reparation moyenne'],
      ['Interventions', 'Total periode active'],
      ['Pannes critiques', 'Action prioritaire'],
      ['SLA', 'Interventions cloturees a temps'],
    ],
    EN: [
      ['Global availability', 'Target above 90%'],
      ['MTBF', 'Average reliability'],
      ['MTTR', 'Average repair time'],
      ['Interventions', 'Active period total'],
      ['Critical breakdowns', 'Priority action'],
      ['SLA', 'Interventions closed on time'],
    ],
    AR: [
      ['التوفر العام', 'الهدف أعلى من 90%'],
      ['MTBF', 'الموثوقية المتوسطة'],
      ['MTTR', 'متوسط الإصلاح'],
      ['التدخلات', 'مجموع الفترة النشطة'],
      ['الأعطال الحرجة', 'إجراء ذو أولوية'],
      ['SLA', 'التدخلات المغلقة في الوقت'],
    ],
  }[language.value] || []
  const values = language.value === 'AR'
    ? ['92 %', '185 ساعة', 'ساعتان و35 دقيقة', '128', '12', '94 %']
    : ['92 %', '185 h', '2 h 35', '128', '12', '94 %']
  const icons = ['%', 'B', 'R', 'I', 'P', 'SLA']
  const colors = ['green', 'yellow', 'orange', 'green', 'red', 'green']

  return labels.map(([label, description], index) => ({
    icon: icons[index],
    label,
    value: values[index],
    description,
    color: colors[index],
  }))
})

const healthItems = computed(() => {
  const items = {
    FR: [
      ["Temps d'arret", '54 h', '-8 h vs semaine passee'],
      ['Respect planning preventif', '92 %', 'Maintenances realisees a temps'],
      ['Cout maintenance', '48 600 DH', 'Budget consolide'],
      ['Machines sous surveillance', '4', 'Criticite haute ou panne repetee'],
    ],
    EN: [
      ['Downtime', '54 h', '-8 h vs last week'],
      ['Preventive schedule compliance', '92 %', 'Maintenance completed on time'],
      ['Maintenance cost', '48 600 DH', 'Consolidated budget'],
      ['Machines under monitoring', '4', 'High criticality or repeated breakdown'],
    ],
    AR: [
      ['وقت التوقف', '54 ساعة', 'ناقص 8 ساعات مقارنة بالأسبوع الماضي'],
      ['احترام التخطيط الوقائي', '92 %', 'صيانة منجزة في الوقت'],
      ['تكلفة الصيانة', '48 600 درهم', 'ميزانية مجمعة'],
      ['آلات تحت المراقبة', '4', 'خطورة عالية أو عطل متكرر'],
    ],
  }[language.value] || []

  return items.map(([label, value, note]) => ({
    label,
    value,
    note,
    direction: /\d/.test(value) && language.value !== 'AR' ? 'ltr' : undefined,
  }))
})

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
  isSidebarOpen.value = false
}
</script>

<style scoped>
.analytics-layout {
  min-height: 100vh;
  background:
    radial-gradient(circle at 18% 0%, rgba(77, 126, 172, 0.14), transparent 28%),
    linear-gradient(180deg, #111927 0%, #101822 46%, #0d1520 100%);
  color: #f4f7fb;
}
.analytics-page { display: grid; gap: 22px; min-height: 100vh; padding: 32px 28px 44px 88px; overflow-x: hidden; }
[dir='rtl'] .analytics-page { padding: 32px 88px 44px 28px; }
.sidebar-toggle { position: fixed; top: 24px; left: 24px; z-index: 1000; display: inline-flex; width: 48px; height: 48px; align-items: center; justify-content: center; flex-direction: column; gap: 5px; background: rgba(17, 27, 38, 0.94); border: 1px solid rgba(126, 146, 170, 0.3); border-radius: 8px; color: #f4f7fb; box-shadow: 0 14px 34px rgba(0, 0, 0, 0.28); cursor: pointer; }
[dir='rtl'] .sidebar-toggle { right: 24px; left: auto; }
.sidebar-toggle.is-hidden { opacity: 0; visibility: hidden; pointer-events: none; }
.sidebar-toggle span { width: 22px; height: 2px; background: currentColor; border-radius: 999px; }
.sidebar-backdrop { position: fixed; inset: 0; z-index: 80; background: rgba(5, 10, 17, 0.54); backdrop-filter: blur(3px); }
.page-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; }
.breadcrumb { margin: 0 0 7px; color: #bce39d; font-size: 12px; font-weight: 900; }
.page-header h1 { margin: 0; color: #f8fbff; font-size: 34px; font-weight: 950; letter-spacing: 0; }
.page-header p { margin: 8px 0 0; color: #aab7c7; font-size: 15px; font-weight: 720; }
.live-pill { display: inline-flex; align-items: center; gap: 9px; min-height: 44px; padding: 0 16px; border-radius: 999px; background: rgba(131, 185, 92, 0.18); color: #bce39d; font-weight: 950; }
.live-pill span { width: 10px; height: 10px; border-radius: 50%; background: #83b95c; box-shadow: 0 0 0 6px rgba(131, 185, 92, 0.16); }
.health-strip { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.health-strip article { padding: 18px; background: rgba(17, 27, 38, 0.92); border: 1px solid rgba(116, 135, 158, 0.28); border-radius: 8px; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 18px 40px rgba(0, 0, 0, 0.24); }
.health-strip span { color: #aeb9c8; font-size: 12px; font-weight: 900; text-transform: uppercase; }
[dir='rtl'] .health-strip span { text-transform: none; }
.health-strip strong { display: block; margin: 8px 0; color: #f8fbff; font-size: 24px; font-weight: 950; unicode-bidi: isolate; }
.health-strip small { color: #bce39d; font-size: 11px; font-weight: 850; }
.section-heading h2 { margin: 4px 0 0; color: #f8fbff; font-size: 20px; font-weight: 950; }
.section-heading p { margin: 5px 0 0; color: #8d9aab; font-size: 13px; font-weight: 750; }
@media (max-width: 1100px) { .health-strip { grid-template-columns: repeat(2, 1fr); } .page-header { align-items: flex-start; flex-direction: column; } }
@media (max-width: 760px) { .analytics-page, [dir='rtl'] .analytics-page { padding: 88px 16px 32px; } .health-strip { grid-template-columns: 1fr; } }
</style>

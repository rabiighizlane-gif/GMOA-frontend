<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="drawer-overlay" @click.self="$emit('close')">
        <aside class="drawer">
          <header class="drawer-header">
            <div><span>Preview rapport</span><h2>{{ report?.title }}</h2></div>
            <button type="button" class="close-button" @click="$emit('close')">×</button>
          </header>
          <div v-if="report" class="drawer-body">
            <section class="report-cover">
              <strong class="brand">SmartCalyx</strong>
              <h3>{{ report.title }}</h3>
              <p>Période : {{ report.period }}</p>
              <p>Généré le {{ report.generatedAt }} par {{ report.generatedBy }}</p>
            </section>
            <section><h3>Résumé KPI</h3><div class="kpi-mini"><div v-for="item in report.kpis" :key="item.label"><span>{{ item.label }}</span><strong>{{ item.value }}</strong></div></div></section>
            <section><h3>Graphiques inclus</h3><p class="muted">Évolution, répartition, coûts et indicateurs de performance.</p></section>
            <section><h3>Tableau récapitulatif</h3><p class="muted">{{ report.rowsCount }} lignes consolidées.</p></section>
            <section class="signature"><span>Signature / validation</span><strong>Responsable Maintenance</strong></section>
          </div>
          <footer class="drawer-footer"><button type="button" class="secondary-button" @click="$emit('download', 'PDF')">Télécharger PDF</button><button type="button" class="primary-button" @click="$emit('download', 'Excel')">Télécharger Excel</button></footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({ open: Boolean, report: { type: Object, default: null } })
defineEmits(['close', 'download'])
</script>

<style scoped>
.drawer-overlay { position: fixed; z-index: 9999; inset: 0; background: rgba(17,24,39,.25); backdrop-filter: blur(2px); }
.drawer { position: absolute; top: 0; right: 0; display: flex; width: min(560px, 100%); height: 100%; flex-direction: column; background: white; box-shadow: -16px 0 40px rgba(0,0,0,.12); }
.drawer-header { display: flex; justify-content: space-between; padding: 24px; border-bottom: 1px solid #edf0e8; }
.drawer-header span { color: #6a9a2a; font-size: 12px; font-weight: 900; text-transform: uppercase; }
.drawer-header h2 { margin: 5px 0 0; color: #111827; font-size: 21px; }
.close-button { width: 36px; height: 36px; background: #f7f9f3; border: 0; border-radius: 10px; cursor: pointer; }
.drawer-body { flex: 1; overflow-y: auto; padding: 24px; display: grid; gap: 16px; }
section { padding: 16px; background: #fafbf7; border: 1px solid #edf0e8; border-radius: 14px; }
.brand { color: #6a9a2a; font-size: 18px; }
h3 { margin: 6px 0 10px; color: #111827; }
p, .muted { color: #64748b; }
.kpi-mini { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.kpi-mini div { padding: 10px; background: white; border-radius: 10px; }
.kpi-mini span { display: block; color: #94a3b8; font-size: 10px; }
.kpi-mini strong { color: #4a0a0a; }
.signature { min-height: 90px; display: grid; align-content: end; }
.drawer-footer { display: flex; gap: 12px; padding: 18px 24px; border-top: 1px solid #edf0e8; }
.drawer-footer button { flex: 1; height: 44px; border-radius: 12px; font-weight: 900; cursor: pointer; }
.secondary-button { background: white; border: 1px solid #dfe5d6; color: #4a0a0a; }
.primary-button { background: #6a9a2a; border: 1px solid #6a9a2a; color: white; }
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-active .drawer, .fade-leave-active .drawer { transition: transform .25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-from .drawer, .fade-leave-to .drawer { transform: translateX(100%); }
</style>

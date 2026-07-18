<template>
  <section class="table-card">
    <div class="table-header"><div><h2>{{ title }}</h2><p>{{ rows.length }} ligne(s) affichée(s)</p></div></div>
    <div class="table-wrapper">
      <table>
        <thead><tr><th v-for="column in columns" :key="column">{{ column }}</th></tr></thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td v-for="column in columns" :key="column">{{ row[column] || '—' }}</td>
          </tr>
          <tr v-if="rows.length === 0"><td :colspan="columns.length" class="empty-state">Aucune donnée disponible.</td></tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
defineProps({ title: { type: String, required: true }, columns: { type: Array, default: () => [] }, rows: { type: Array, default: () => [] } })
</script>

<style scoped>
.table-card { overflow: hidden; background: white; border: 1px solid #edf0e8; border-radius: 20px; box-shadow: 0 10px 30px rgba(74,10,10,.05); }
.table-header { padding: 20px 22px; border-bottom: 1px solid #edf0e8; }
.table-header h2 { margin: 0; color: #111827; font-size: 17px; }
.table-header p { margin: 5px 0 0; color: #94a3b8; font-size: 11px; }
.table-wrapper { overflow-x: auto; }
table { width: 100%; min-width: 900px; border-collapse: collapse; }
thead { background: #fafbf7; }
th, td { padding: 14px 15px; border-top: 1px solid #edf0e8; color: #4a0a0a; font-size: 12px; text-align: left; }
th { border-top: 0; color: #64748b; font-size: 10px; font-weight: 900; text-transform: uppercase; }
tbody tr:hover { background: #fbfcf8; }
.empty-state { padding: 40px !important; text-align: center; color: #94a3b8; }
</style>

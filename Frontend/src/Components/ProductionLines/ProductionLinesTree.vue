<template>
  <section class="tree-panel" aria-labelledby="production-lines-tree-title">
    <header>
      <div>
        <h2 id="production-lines-tree-title">Organisation des lignes</h2>
        <p>Lignes, zones et machines disponibles depuis les donnees backend.</p>
      </div>
      <span>{{ lines.length }} {{ lineWord(lines.length) }}</span>
    </header>

    <div v-if="!lines.length" class="tree-empty">Aucune ligne disponible pour construire l'organisation.</div>

    <ul v-else class="tree-list">
      <li v-for="line in lines" :key="line.id" class="tree-node">
        <button type="button" class="tree-toggle" :aria-expanded="isLineOpen(line.id)" @click="toggleLine(line)">
          <ChevronRight :class="{ open: isLineOpen(line.id) }" :size="18" aria-hidden="true" />
          <span>
            <strong>{{ displayValue(line.name) }}</strong>
            <small>{{ displayValue(line.code) }} - {{ line.zonesCount }} {{ zoneWord(line.zonesCount) }} - {{ line.machinesCount }} {{ machineWord(line.machinesCount) }}</small>
          </span>
        </button>

        <div v-if="isLineOpen(line.id)" class="tree-children">
          <div v-if="loadingLineId === line.id" class="tree-loader">Chargement du detail...</div>
          <div v-else-if="treeErrors[line.id]" class="tree-error">{{ treeErrors[line.id] }}</div>
          <div v-else-if="!lineDetails[line.id]?.zones?.length" class="tree-empty">Aucune zone ou machine associee.</div>
          <ul v-else class="zone-tree">
            <li v-for="zone in lineDetails[line.id].zones" :key="zone.id">
              <button type="button" class="zone-toggle" :aria-expanded="isZoneOpen(zone.id)" @click="toggleZone(zone.id)">
                <ChevronRight :class="{ open: isZoneOpen(zone.id) }" :size="16" aria-hidden="true" />
                <span>
                  <strong>{{ displayValue(zone.name) }}</strong>
                  <small>{{ zone.machines_count }} {{ machineWord(zone.machines_count) }}</small>
                </span>
              </button>

              <ul v-if="isZoneOpen(zone.id)" class="machine-tree">
                <li v-for="machine in zone.machines" :key="machine.id">
                  <Wrench :size="15" aria-hidden="true" />
                  <span>{{ displayValue(machine.code) }} - {{ displayValue(machine.name) }}</span>
                </li>
                <li v-if="!zone.machines.length" class="tree-empty">Aucune machine dans cette zone.</li>
              </ul>
            </li>
          </ul>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ChevronRight, Wrench } from '@lucide/vue'
import { getProductionLineById } from '@/services/productionLinesService'

defineProps({
  lines: {
    type: Array,
    default: () => [],
  },
})

const openLines = ref(new Set())
const openZones = ref(new Set())
const lineDetails = reactive({})
const treeErrors = reactive({})
const loadingLineId = ref(null)

function isLineOpen(id) {
  return openLines.value.has(id)
}

function isZoneOpen(id) {
  return openZones.value.has(id)
}

async function toggleLine(line) {
  const nextOpenLines = new Set(openLines.value)

  if (nextOpenLines.has(line.id)) {
    nextOpenLines.delete(line.id)
    openLines.value = nextOpenLines
    return
  }

  nextOpenLines.add(line.id)
  openLines.value = nextOpenLines

  if (lineDetails[line.id]) return

  loadingLineId.value = line.id
  treeErrors[line.id] = ''

  try {
    lineDetails[line.id] = normalizeLine(await getProductionLineById(line.id))
  } catch (error) {
    treeErrors[line.id] = error.message || 'Impossible de charger le detail de la ligne.'
  } finally {
    loadingLineId.value = null
  }
}

function toggleZone(id) {
  const nextOpenZones = new Set(openZones.value)

  if (nextOpenZones.has(id)) nextOpenZones.delete(id)
  else nextOpenZones.add(id)

  openZones.value = nextOpenZones
}

function normalizeLine(data) {
  const zones = data?.zones || data?.production_zones || data?.productionZones || []
  const machines = normalizeMachines(data?.machines || data?.equipments || [])

  return {
    zones: Array.isArray(zones) && zones.length ? zones.map(normalizeZone) : buildZoneGroupsFromMachines(machines),
  }
}

function normalizeZone(zone) {
  const machines = normalizeMachines(zone.machines || zone.equipments || [])

  return {
    id: zone.id ?? zone.zone_id ?? zone.zoneId ?? zone.code ?? zone.name,
    code: zone.code ?? zone.zone_code ?? zone.zoneCode ?? '',
    name: zone.name ?? zone.label ?? zone.zone_name ?? zone.zoneName ?? '',
    machines_count: Number(zone.machines_count ?? zone.machine_count ?? zone.machineCount ?? machines.length ?? 0),
    machines,
  }
}

function normalizeMachines(machines) {
  return Array.isArray(machines)
    ? machines.map((machine) => ({
        id: machine.id ?? machine.equipment_id ?? machine.equipmentId ?? machine.code,
        code: machine.code ?? '',
        name: machine.name ?? machine.label ?? '',
        zoneId: machine.zone_id ?? machine.zoneId ?? machine.zone?.id ?? null,
        zoneCode: machine.zone?.code ?? '',
        zoneName: machine.zone?.name ?? machine.zone_name ?? '',
      }))
    : []
}

function buildZoneGroupsFromMachines(machines) {
  const groups = new Map()

  machines.forEach((machine) => {
    const id = machine.zoneId ?? machine.zoneCode ?? machine.zoneName ?? 'unassigned'
    const existing = groups.get(id) || { id, code: machine.zoneCode, name: machine.zoneName || 'Sans zone', machines_count: 0, machines: [] }

    existing.machines.push(machine)
    existing.machines_count = existing.machines.length
    groups.set(id, existing)
  })

  return [...groups.values()]
}

function displayValue(value) {
  return value || '-'
}

function lineWord(count) {
  return count > 1 ? 'lignes' : 'ligne'
}

function zoneWord(count) {
  return count > 1 ? 'zones' : 'zone'
}

function machineWord(count) {
  return count > 1 ? 'machines' : 'machine'
}
</script>

<style scoped>
.tree-panel {
  border: 1px solid var(--sc-border);
  border-radius: 8px;
  background: var(--sc-surface);
  box-shadow: var(--sc-shadow);
  overflow: hidden;
}

.tree-panel > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px;
  border-bottom: 1px solid var(--sc-border);
}

.tree-panel h2 {
  margin: 0;
  color: var(--sc-dark);
  font-size: 20px;
  font-weight: 950;
}

.tree-panel p {
  margin: 6px 0 0;
  color: var(--sc-muted);
  font-size: 14px;
  font-weight: 750;
}

.tree-panel > header > span {
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: var(--sc-soft-secondary);
  color: var(--sc-primary);
  padding: 0 12px;
  font-size: 13px;
  font-weight: 950;
}

.tree-list,
.zone-tree,
.machine-tree {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 14px;
  list-style: none;
}

.tree-node,
.zone-tree > li {
  border: 1px solid var(--sc-border);
  border-radius: 8px;
  background: var(--sc-bg);
}

.tree-toggle,
.zone-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 0;
  background: transparent;
  color: var(--sc-dark);
  padding: 12px;
  text-align: left;
  cursor: pointer;
}

.tree-toggle:focus-visible,
.zone-toggle:focus-visible {
  outline: 3px solid var(--sc-soft-secondary);
}

.tree-toggle svg,
.zone-toggle svg {
  color: var(--sc-primary);
  transition: transform 0.16s ease;
}

.tree-toggle svg.open,
.zone-toggle svg.open {
  transform: rotate(90deg);
}

.tree-toggle strong,
.zone-toggle strong {
  display: block;
  font-size: 14px;
  font-weight: 950;
}

.tree-toggle small,
.zone-toggle small {
  display: block;
  margin-top: 3px;
  color: var(--sc-muted);
  font-size: 12px;
  font-weight: 760;
}

.tree-children {
  padding: 0 12px 12px 34px;
}

.zone-tree {
  padding: 0;
}

.machine-tree {
  padding: 0 12px 12px 42px;
}

.machine-tree li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  color: var(--sc-dark);
  font-size: 13px;
  font-weight: 850;
}

.machine-tree svg {
  color: var(--sc-primary);
}

.tree-empty,
.tree-loader,
.tree-error {
  padding: 14px 20px;
  color: var(--sc-muted);
  font-size: 13px;
  font-weight: 800;
}

.tree-error {
  color: var(--sc-danger);
}

@media (max-width: 780px) {
  .tree-panel > header {
    align-items: flex-start;
    flex-direction: column;
  }

  .tree-children,
  .machine-tree {
    padding-left: 12px;
  }
}
</style>

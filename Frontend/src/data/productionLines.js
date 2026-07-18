const productionLinesStorageKey = 'smartcalyx-production-lines'

export const defaultProductionLines = [
  {
    id: 'LP-01',
    name: 'Ligne Production 1',
    department: 'Production',
    manager: 'Youssef Amrani',
    status: 'Active',
    statusTone: 'healthy',
    capacity: '1 200 unités/jour',
    machinesCount: 14,
    operatorsCount: 6,
    location: 'Atelier A',
    description: "Ligne dédiée aux opérations d'usinage et de préparation mécanique.",
  },
  {
    id: 'LP-02',
    name: 'Ligne Production 2',
    department: 'Production',
    manager: 'Nadia Benkirane',
    status: 'Sous surveillance',
    statusTone: 'warning',
    capacity: '900 unités/jour',
    machinesCount: 12,
    operatorsCount: 5,
    location: 'Atelier B',
    description: 'Ligne principale de pressage, assemblage et contrôle qualité.',
  },
  {
    id: 'LC-01',
    name: 'Ligne Conditionnement',
    department: 'Conditionnement',
    manager: 'Sara El Idrissi',
    status: 'Active',
    statusTone: 'healthy',
    capacity: '1 800 unités/jour',
    machinesCount: 10,
    operatorsCount: 8,
    location: 'Zone conditionnement',
    description: 'Ligne utilisée pour le transfert, emballage et étiquetage des produits finis.',
  },
  {
    id: 'LU-01',
    name: 'Ligne Utilités',
    department: 'Maintenance',
    manager: 'Hamza Ait Ali',
    status: 'Maintenance',
    statusTone: 'danger',
    capacity: 'Support usine',
    machinesCount: 7,
    operatorsCount: 3,
    location: 'Local technique',
    description: "Ligne regroupant les équipements d'air comprimé, énergie et utilités.",
  },
]

export function getProductionLines() {
  const savedLines = localStorage.getItem(productionLinesStorageKey)

  if (!savedLines) return defaultProductionLines

  try {
    const parsedLines = JSON.parse(savedLines)

    return Array.isArray(parsedLines) ? parsedLines : defaultProductionLines
  } catch {
    return defaultProductionLines
  }
}

export function saveProductionLines(lines) {
  localStorage.setItem(productionLinesStorageKey, JSON.stringify(lines))
}

export function findProductionLineById(id) {
  return getProductionLines().find((line) => line.id === id)
}

export function addProductionLine(line) {
  const lineToSave = {
    ...line,
    machinesCount: Number(line.machinesCount || 0),
    operatorsCount: Number(line.operatorsCount || 0),
    statusTone: getLineStatusTone(line.status),
  }

  saveProductionLines([lineToSave, ...getProductionLines()])

  return lineToSave
}

export function getLineStatusTone(status) {
  const normalizedStatus = String(status || '').toLowerCase()

  if (normalizedStatus.includes('maintenance') || normalizedStatus.includes('arrêt')) return 'danger'
  if (normalizedStatus.includes('surveillance')) return 'warning'
  return 'healthy'
}

export const productionLineRelations = {
  machines: [
    { id: 'M-102', name: "Tour d'usinage", status: 'En service' },
    { id: 'M-215', name: 'Presse hydraulique', status: 'En panne' },
    { id: 'M-309', name: 'Convoyeur à bande', status: 'En service' },
  ],
  planning: [
    { shift: 'Matin', team: 'Équipe A', target: '420 unités', status: 'Planifié' },
    { shift: 'Après-midi', team: 'Équipe B', target: '390 unités', status: 'Planifié' },
    { shift: 'Nuit', team: 'Équipe C', target: '260 unités', status: 'À confirmer' },
  ],
  activity: [
    { type: 'Contrôle qualité', detail: 'Contrôle ligne terminé sans écart majeur.', time: '17/07/2026 10:30' },
    { type: 'Maintenance préventive', detail: 'Vérification capteurs et convoyeurs planifiée.', time: '17/07/2026 14:00' },
    { type: 'Changement équipe', detail: "Passage d'informations entre équipe A et B.", time: '17/07/2026 15:05' },
  ],
}

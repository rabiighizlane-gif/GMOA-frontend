const machinesStorageKey = 'smartcalyx-machines'

export const defaultMachines = [
  {
    id: 'M-102',
    name: "Tour d'usinage",
    line: 'Ligne Production 1',
    type: 'Usinage',
    department: 'Production',
    manufacturer: 'Mazak',
    model: 'QT-200',
    serialNumber: 'MX-102-8841',
    commissioningDate: '12/03/2021',
    location: 'Atelier A',
    status: 'En service',
    statusTone: 'healthy',
    criticality: 'Moyenne',
    criticalityTone: 'medium',
    description: "Machine de tournage utilisée pour les pièces mécaniques de précision.",
    imageUrl: '/documents/machines/common/photo-zone-machine.svg',
    availability: '96%',
    mtbf: '420 h',
    mttr: '3.5 h',
    breakdownCount: 2,
    downtime: '7 h',
    interventionCount: 8,
    maintenanceCost: '18 400 MAD',
  },
  {
    id: 'M-215',
    name: 'Presse hydraulique',
    line: 'Ligne Production 2',
    type: 'Pressage',
    department: 'Production',
    manufacturer: 'Bosch Rexroth',
    model: 'HP-400',
    serialNumber: 'BR-215-4490',
    commissioningDate: '18/09/2020',
    location: 'Atelier B',
    status: 'En panne',
    statusTone: 'danger',
    criticality: 'Haute',
    criticalityTone: 'high',
    description: 'Presse hydraulique centrale pour les opérations de formage et assemblage.',
    imageUrl: '/documents/machines/common/photo-zone-machine.svg',
    availability: '82%',
    mtbf: '210 h',
    mttr: '8 h',
    breakdownCount: 5,
    downtime: '40 h',
    interventionCount: 14,
    maintenanceCost: '52 800 MAD',
  },
  {
    id: 'M-309',
    name: 'Convoyeur à bande',
    line: 'Ligne Conditionnement',
    type: 'Convoyage',
    department: 'Conditionnement',
    manufacturer: 'Interroll',
    model: 'BM-309',
    serialNumber: 'IR-309-7718',
    commissioningDate: '04/06/2022',
    location: 'Zone conditionnement',
    status: 'En service',
    statusTone: 'healthy',
    criticality: 'Moyenne',
    criticalityTone: 'medium',
    description: 'Convoyeur principal pour le transfert des produits finis vers la zone emballage.',
    imageUrl: '/documents/machines/common/photo-zone-machine.svg',
    availability: '94%',
    mtbf: '360 h',
    mttr: '4 h',
    breakdownCount: 3,
    downtime: '12 h',
    interventionCount: 10,
    maintenanceCost: '21 900 MAD',
  },
  {
    id: 'M-412',
    name: "Compresseur d'air",
    line: 'Ligne Utilités',
    type: 'Utilités',
    department: 'Maintenance',
    manufacturer: 'Atlas Copco',
    model: 'GA-37',
    serialNumber: 'AC-412-2201',
    commissioningDate: '27/01/2019',
    location: 'Local technique',
    status: 'Sous surveillance',
    statusTone: 'warning',
    criticality: 'Haute',
    criticalityTone: 'high',
    description: "Compresseur alimentant le réseau d'air comprimé de l'usine.",
    imageUrl: '/documents/machines/common/photo-zone-machine.svg',
    availability: '88%',
    mtbf: '260 h',
    mttr: '6 h',
    breakdownCount: 4,
    downtime: '24 h',
    interventionCount: 12,
    maintenanceCost: '39 600 MAD',
  },
]

export function findMachineById(id) {
  return getMachines().find((machine) => machine.id === id)
}

export function getMachines() {
  const savedMachines = localStorage.getItem(machinesStorageKey)

  if (!savedMachines) return defaultMachines

  try {
    const parsedMachines = JSON.parse(savedMachines)

    return Array.isArray(parsedMachines) ? parsedMachines : defaultMachines
  } catch {
    return defaultMachines
  }
}

export function saveMachines(machines) {
  localStorage.setItem(machinesStorageKey, JSON.stringify(machines))
}

export function addMachine(machine) {
  const machines = getMachines()
  const machineToSave = {
    ...machine,
    statusTone: getStatusTone(machine.status),
    criticalityTone: getCriticalityTone(machine.criticality),
    availability: machine.availability || '100%',
    mtbf: machine.mtbf || '0 h',
    mttr: machine.mttr || '0 h',
    breakdownCount: Number(machine.breakdownCount || 0),
    downtime: machine.downtime || '0 h',
    interventionCount: Number(machine.interventionCount || 0),
    maintenanceCost: machine.maintenanceCost || '0 MAD',
  }

  saveMachines([machineToSave, ...machines])

  return machineToSave
}

export function getStatusTone(status) {
  const normalizedStatus = String(status || '').toLowerCase()

  if (normalizedStatus.includes('panne') || normalizedStatus.includes('arrêtée') || normalizedStatus.includes('arretee')) return 'danger'
  if (normalizedStatus.includes('surveillance')) return 'warning'
  return 'healthy'
}

export function getCriticalityTone(criticality) {
  const normalizedCriticality = String(criticality || '').toLowerCase()

  if (normalizedCriticality.includes('haute')) return 'high'
  if (normalizedCriticality.includes('moyenne')) return 'medium'
  return 'healthy'
}

export const machineRelations = {
  interventions: [
    {
      type: 'Intervention corrective',
      technician: 'Nabil',
      requestedBy: 'Karim El Fassi',
      startDate: '15/07/2026 08:30',
      endDate: '15/07/2026 14:10',
      duration: '5 h 40',
      status: 'Terminée',
      report: 'Remplacement joint hydraulique et test pression.',
    },
    {
      type: 'Intervention préventive',
      technician: 'Ahmed',
      requestedBy: 'Meryem Alaoui',
      startDate: '08/07/2026 10:00',
      endDate: '08/07/2026 11:25',
      duration: '1 h 25',
      status: 'Terminée',
      report: 'Contrôle niveau huile, serrage et nettoyage capteurs.',
    },
  ],
  breakdowns: [
    {
      type: 'Fuite hydraulique',
      description: 'Perte de pression pendant le cycle de pressage.',
      declaredAt: '15/07/2026 08:05',
      cause: 'Joint usé sur le vérin principal',
      downtime: '5 h 40',
      solution: 'Joint remplacé, circuit purgé et pression stabilisée.',
      status: 'Résolue',
    },
    {
      type: 'Surchauffe',
      description: 'Température huile supérieure au seuil.',
      declaredAt: '22/06/2026 13:20',
      cause: 'Filtre colmaté',
      downtime: '2 h 15',
      solution: 'Filtre remplacé et radiateur nettoyé.',
      status: 'Résolue',
    },
  ],
  preventiveMaintenance: [
    {
      plan: 'Contrôle hydraulique mensuel',
      frequency: 'Mensuelle',
      nextDue: '01/08/2026',
      lastCheck: '01/07/2026',
      checklist: 'Huile, pression, capteurs, sécurité',
      technician: 'Youssef',
      planningStatus: 'Planifié',
    },
    {
      plan: 'Inspection sécurité',
      frequency: 'Trimestrielle',
      nextDue: '15/09/2026',
      lastCheck: '15/06/2026',
      checklist: 'Arrêts urgence, carters, signalisations',
      technician: 'Sara',
      planningStatus: 'À venir',
    },
  ],
  spareParts: [
    {
      name: 'Joint hydraulique',
      quantity: 2,
      reference: 'JH-400-22',
      usedAt: '15/07/2026',
      stock: 6,
      cost: '1 200 MAD',
    },
    {
      name: 'Filtre huile',
      quantity: 1,
      reference: 'FH-37-09',
      usedAt: '22/06/2026',
      stock: 11,
      cost: '480 MAD',
    },
  ],
  documents: [
    {
      type: "Manuel d'utilisation",
      name: 'Manuel maintenance machine.pdf',
      date: '12/03/2024',
      url: '/documents/machines/common/manuel-maintenance-machine.pdf',
    },
    {
      type: 'Fiche technique',
      name: 'Fiche technique machine.pdf',
      date: '12/03/2024',
      url: '/documents/machines/common/fiche-technique-machine.pdf',
    },
    {
      type: 'Photo',
      name: 'Photo zone machine.svg',
      date: '03/05/2026',
      url: '/documents/machines/common/photo-zone-machine.svg',
    },
    {
      type: 'Consignes de sécurité',
      name: 'Consignes sécurité machine.pdf',
      date: '11/01/2026',
      url: '/documents/machines/common/consignes-securite-machine.pdf',
    },
  ],
  activity: [
    { type: 'Panne signalée', detail: 'Fuite hydraulique déclarée par opérateur.', time: '15/07/2026 08:05' },
    { type: 'Intervention créée', detail: 'Nabil affecté à la corrective.', time: '15/07/2026 08:18' },
    { type: 'Pièce remplacée', detail: 'Joint hydraulique JH-400-22 utilisé.', time: '15/07/2026 11:40' },
    { type: 'Statut modifié', detail: 'Machine remise en service après validation.', time: '15/07/2026 14:10' },
  ],
}

<template>
  <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
    <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">⚡ Actions Rapides</h4>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <button @click="$router.push('/admin/pannes')" class="flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium text-xs rounded-lg transition-colors border border-rose-100">
        <span>🚨</span> Signaler une Panne
      </button>
      
      <button @click="$router.push('/admin/interventions')" class="flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium text-xs rounded-lg transition-colors border border-amber-100">
        <span>🔧</span> Créer Intervention
      </button>

      <button @click="$router.push('/admin/users')" class="flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium text-xs rounded-lg transition-colors border border-emerald-100">
        <span>👥</span> Ajouter Utilisateur
      </button>

      <button @click="$router.push('/admin/reports')" class="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs rounded-lg transition-colors border border-slate-200">
        <span>📊</span> Exporter Rapport
      </button>
    </div>
  </div>
</template>

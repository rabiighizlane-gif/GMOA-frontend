<template>
  <section class="settings-panel">
    <div class="panel-heading">
      <h2>Utilisateurs & rôles</h2>
      <p>Configuration des rôles, permissions et actions d'administration.</p>
    </div>

    <form v-if="isEditorOpen" class="role-editor" @submit.prevent="saveRole">
      <label>Nom du rôle<input v-model="roleForm.name" required /></label>
      <label>Description<input v-model="roleForm.description" required /></label>
      <div>
        <button type="submit" class="primary-action">{{ editingRoleIndex === null ? 'Créer le rôle' : 'Enregistrer' }}</button>
        <button type="button" @click="closeEditor">Annuler</button>
      </div>
    </form>

    <div class="role-list">
      <article v-for="(role, index) in roles" :key="role.name">
        <div class="role-main">
          <strong>{{ role.name }}</strong>
          <span>{{ role.description }}</span>
          <div v-if="expandedRole === role.name" class="permissions-list">
            <div class="permissions-header">
              <strong>Permissions actives</strong>
              <button type="button" @click="expandedRole = ''">Fermer</button>
            </div>
            <div class="permission-tags">
              <label v-for="permission in role.permissions" :key="permission">
                <input checked type="checkbox" />
                <span>{{ permission }}</span>
              </label>
            </div>
          </div>
        </div>

        <div class="actions">
          <button type="button" @click="openCreateEditor">Créer</button>
          <button type="button" @click="openEditEditor(role, index)">Modifier</button>
          <button type="button" @click="deleteRole(index)">Supprimer</button>
          <button type="button" @click="togglePermissions(role.name)">
            {{ expandedRole === role.name ? 'Masquer' : 'Permissions' }}
          </button>
        </div>
      </article>
    </div>

    <button type="button" class="danger-light" @click="resetPassword">Réinitialiser mot de passe</button>

    <Transition name="toast">
      <div v-if="toastMessage" class="mini-toast">{{ toastMessage }}</div>
    </Transition>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'

const roles = ref([
  {
    name: 'Super Admin',
    description: 'Accès total, lecture globale, gestion utilisateurs et rôles.',
    permissions: ['Voir toutes les statistiques', 'Gérer les utilisateurs', 'Gérer les rôles', 'Voir toutes les pannes'],
  },
  {
    name: 'Responsable',
    description: 'Validation, planification et suivi des opérations.',
    permissions: ['Valider les demandes', 'Planifier la maintenance', 'Consulter les rapports'],
  },
  {
    name: 'Technicien',
    description: 'Interventions, diagnostics, pièces et clôtures.',
    permissions: ['Traiter les interventions', 'Utiliser les pièces', 'Clôturer les interventions'],
  },
  {
    name: 'Opérateur',
    description: 'Déclaration pannes et demandes de maintenance.',
    permissions: ['Déclarer une panne', 'Créer une demande', 'Consulter ses demandes'],
  },
])

const roleForm = reactive({ name: '', description: '' })
const isEditorOpen = ref(false)
const editingRoleIndex = ref(null)
const expandedRole = ref('')
const toastMessage = ref('')

function openCreateEditor() {
  editingRoleIndex.value = null
  roleForm.name = ''
  roleForm.description = ''
  isEditorOpen.value = true
}

function openEditEditor(role, index) {
  editingRoleIndex.value = index
  roleForm.name = role.name
  roleForm.description = role.description
  isEditorOpen.value = true
}

function closeEditor() {
  isEditorOpen.value = false
}

function saveRole() {
  const role = {
    name: roleForm.name.trim(),
    description: roleForm.description.trim(),
    permissions: ['Consulter', 'Créer', 'Modifier'],
  }

  if (editingRoleIndex.value === null) {
    roles.value.push(role)
    showToast('Rôle créé.')
  } else {
    roles.value[editingRoleIndex.value] = {
      ...roles.value[editingRoleIndex.value],
      ...role,
    }
    showToast('Rôle modifié.')
  }

  closeEditor()
}

function deleteRole(index) {
  const protectedRoles = ['Super Admin']
  if (protectedRoles.includes(roles.value[index].name)) {
    showToast('Le rôle Super Admin ne peut pas être supprimé.')
    return
  }

  roles.value.splice(index, 1)
  showToast('Rôle supprimé.')
}

function togglePermissions(roleName) {
  expandedRole.value = expandedRole.value === roleName ? '' : roleName
}

function resetPassword() {
  showToast('Lien de réinitialisation préparé.')
}

function showToast(message) {
  toastMessage.value = message
  window.setTimeout(() => {
    toastMessage.value = ''
  }, 1800)
}
</script>

<style scoped>
@import './settings.css';
.role-editor { display: grid; grid-template-columns: minmax(180px, 1fr) minmax(240px, 1.4fr) auto; gap: 12px; align-items: end; margin-bottom: 16px; padding: 16px; border: 1px solid #edf0e8; border-radius: 16px; background: #fbfcf8; }
.role-editor label { display: grid; gap: 7px; color: #64748b; font-size: 12px; font-weight: 900; }
.role-editor input { min-height: 42px; min-width: 0; padding: 0 12px; border: 1px solid #dfe5d6; border-radius: 12px; color: #4a0a0a; font: inherit; font-weight: 850; }
.role-editor div { display: flex; gap: 8px; }
.role-editor button { min-height: 42px; padding: 0 12px; border-radius: 11px; border: 1px solid #dfe5d6; background: white; color: #4a0a0a; font-weight: 900; cursor: pointer; }
.role-editor .primary-action { margin-top: 0; color: white; }
.role-list { display: grid; gap: 12px; }
.role-list article { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; padding: 16px; border: 1px solid #edf0e8; border-radius: 16px; background: #fbfcf8; }
.role-main { min-width: 0; }
.role-list strong, .role-list span { display: block; }
.role-list strong { color: #4a0a0a; font-weight: 950; }
.role-list span { margin-top: 5px; color: #64748b; font-size: 12px; font-weight: 750; }
.permissions-list { margin-top: 12px; padding: 12px; border: 1px solid #dfe5d6; border-radius: 14px; background: white; }
.permissions-header { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
.permissions-header strong { color: #6a9a2a; font-size: 12px; }
.permissions-header button { min-height: 30px; padding: 0 10px; border: 1px solid #dfe5d6; border-radius: 999px; background: #fbfcf8; color: #4a0a0a; font-size: 11px; font-weight: 900; cursor: pointer; }
.permission-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.permission-tags label { display: inline-flex; align-items: center; gap: 7px; min-height: 32px; padding: 0 10px; border-radius: 999px; background: #fbfcf8; border: 1px solid #dfe5d6; color: #4a0a0a; font-size: 11px; font-weight: 900; }
.permissions-list input { accent-color: #6a9a2a; }
.actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
.actions button, .danger-light { min-height: 36px; padding: 0 12px; border-radius: 10px; border: 1px solid #dfe5d6; background: white; color: #4a0a0a; font-weight: 900; cursor: pointer; }
.danger-light { margin-top: 14px; border-color: #ffd6d6; color: #e31e24; }
.mini-toast { position: fixed; right: 24px; bottom: 24px; z-index: 11000; padding: 13px 16px; border-radius: 14px; background: #4a0a0a; color: white; font-weight: 900; box-shadow: 0 18px 44px rgba(74,10,10,.22); }
.toast-enter-active, .toast-leave-active { transition: .22s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(8px); }
@media (max-width: 1100px) { .role-editor { grid-template-columns: 1fr; } }
@media (max-width: 900px) { .role-list article { align-items: stretch; flex-direction: column; } .actions { justify-content: flex-start; } }
</style>

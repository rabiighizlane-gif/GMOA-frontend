<template>
  <section class="settings-panel">
    <div class="panel-heading"><h2>{{ t.title }}</h2><p>{{ t.subtitle }}</p></div>

    <form v-if="isEditorOpen" class="role-editor" @submit.prevent="saveRole">
      <label>{{ t.roleName }}<input v-model="roleForm.name" required /></label>
      <label>{{ t.description }}<input v-model="roleForm.description" required /></label>
      <div>
        <button type="submit" class="primary-action">{{ editingRoleIndex === null ? t.createRole : t.save }}</button>
        <button type="button" @click="closeEditor">{{ t.cancel }}</button>
      </div>
    </form>

    <div class="role-list">
      <article v-for="(role, index) in roles" :key="role.key">
        <div class="role-main">
          <strong>{{ roleLabel(role) }}</strong>
          <span>{{ roleDescription(role) }}</span>
          <div v-if="expandedRole === role.key" class="permissions-list">
            <div class="permissions-header">
              <strong>{{ t.activePermissions }}</strong>
              <button type="button" @click="expandedRole = ''">{{ t.close }}</button>
            </div>
            <div class="permission-tags">
              <label v-for="permission in role.permissions" :key="permission">
                <input checked type="checkbox" />
                <span>{{ permissionLabel(permission) }}</span>
              </label>
            </div>
          </div>
        </div>

        <div class="actions">
          <button type="button" @click="openCreateEditor">{{ t.create }}</button>
          <button type="button" @click="openEditEditor(role, index)">{{ t.edit }}</button>
          <button type="button" @click="deleteRole(index)">{{ t.delete }}</button>
          <button type="button" @click="togglePermissions(role.key)">
            {{ expandedRole === role.key ? t.hide : t.permissions }}
          </button>
        </div>
      </article>
    </div>

    <button type="button" class="danger-light" @click="resetPassword">{{ t.resetPassword }}</button>

    <Transition name="toast">
      <div v-if="toastMessage" class="mini-toast">{{ toastMessage }}</div>
    </Transition>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)

const t = computed(() => ({
  FR: { title: 'Utilisateurs & roles', subtitle: "Configuration des roles, permissions et actions d'administration.", roleName: 'Nom du role', description: 'Description', createRole: 'Creer le role', save: 'Enregistrer', cancel: 'Annuler', activePermissions: 'Permissions actives', close: 'Fermer', create: 'Creer', edit: 'Modifier', delete: 'Supprimer', hide: 'Masquer', permissions: 'Permissions', resetPassword: 'Reinitialiser mot de passe', created: 'Role cree.', updated: 'Role modifie.', deleted: 'Role supprime.', protected: 'Le role Super Admin ne peut pas etre supprime.', resetReady: 'Lien de reinitialisation prepare.' },
  EN: { title: 'Users & roles', subtitle: 'Role, permission, and administration action configuration.', roleName: 'Role name', description: 'Description', createRole: 'Create role', save: 'Save', cancel: 'Cancel', activePermissions: 'Active permissions', close: 'Close', create: 'Create', edit: 'Edit', delete: 'Delete', hide: 'Hide', permissions: 'Permissions', resetPassword: 'Reset password', created: 'Role created.', updated: 'Role updated.', deleted: 'Role deleted.', protected: 'The Super Admin role cannot be deleted.', resetReady: 'Reset link prepared.' },
  AR: { title: 'المستخدمون والأدوار', subtitle: 'إعداد الأدوار والصلاحيات وإجراءات الإدارة.', roleName: 'اسم الدور', description: 'الوصف', createRole: 'إنشاء الدور', save: 'حفظ', cancel: 'إلغاء', activePermissions: 'الصلاحيات النشطة', close: 'إغلاق', create: 'إنشاء', edit: 'تعديل', delete: 'حذف', hide: 'إخفاء', permissions: 'الصلاحيات', resetPassword: 'إعادة تعيين كلمة المرور', created: 'تم إنشاء الدور.', updated: 'تم تعديل الدور.', deleted: 'تم حذف الدور.', protected: 'لا يمكن حذف دور Super Admin.', resetReady: 'تم تجهيز رابط إعادة التعيين.' },
})[language.value] || {})

const roleTexts = {
  superadmin: {
    name: { FR: 'Super Admin', EN: 'Super Admin', AR: 'المدير العام' },
    description: { FR: 'Acces total, lecture globale, gestion utilisateurs et roles.', EN: 'Full access, global view, user and role management.', AR: 'ولوج كامل، عرض شامل، وتدبير المستخدمين والأدوار.' },
    permissions: ['stats', 'users', 'roles', 'breakdowns'],
  },
  manager: {
    name: { FR: 'Responsable', EN: 'Manager', AR: 'مسؤول' },
    description: { FR: 'Validation, planification et suivi des operations.', EN: 'Approval, planning, and operation tracking.', AR: 'المصادقة، التخطيط وتتبع العمليات.' },
    permissions: ['requests', 'planning', 'reports'],
  },
  technician: {
    name: { FR: 'Technicien', EN: 'Technician', AR: 'تقني' },
    description: { FR: 'Interventions, diagnostics, pieces et clotures.', EN: 'Interventions, diagnostics, parts, and closures.', AR: 'التدخلات، التشخيص، القطع والإغلاق.' },
    permissions: ['interventions', 'parts', 'closeInterventions'],
  },
  operator: {
    name: { FR: 'Operateur', EN: 'Operator', AR: 'مشغل' },
    description: { FR: 'Declaration pannes et demandes de maintenance.', EN: 'Breakdown reporting and maintenance requests.', AR: 'التبليغ عن الأعطال وطلبات الصيانة.' },
    permissions: ['declareBreakdown', 'createRequest', 'ownRequests'],
  },
}

const permissionTexts = {
  stats: { FR: 'Voir toutes les statistiques', EN: 'View all statistics', AR: 'عرض جميع الإحصائيات' },
  users: { FR: 'Gerer les utilisateurs', EN: 'Manage users', AR: 'تدبير المستخدمين' },
  roles: { FR: 'Gerer les roles', EN: 'Manage roles', AR: 'تدبير الأدوار' },
  breakdowns: { FR: 'Voir toutes les pannes', EN: 'View all breakdowns', AR: 'عرض جميع الأعطال' },
  requests: { FR: 'Valider les demandes', EN: 'Approve requests', AR: 'المصادقة على الطلبات' },
  planning: { FR: 'Planifier la maintenance', EN: 'Plan maintenance', AR: 'تخطيط الصيانة' },
  reports: { FR: 'Consulter les rapports', EN: 'View reports', AR: 'الاطلاع على التقارير' },
  interventions: { FR: 'Traiter les interventions', EN: 'Handle interventions', AR: 'معالجة التدخلات' },
  parts: { FR: 'Utiliser les pieces', EN: 'Use parts', AR: 'استعمال القطع' },
  closeInterventions: { FR: 'Cloturer les interventions', EN: 'Close interventions', AR: 'إغلاق التدخلات' },
  declareBreakdown: { FR: 'Declarer une panne', EN: 'Report a breakdown', AR: 'التبليغ عن عطل' },
  createRequest: { FR: 'Creer une demande', EN: 'Create a request', AR: 'إنشاء طلب' },
  ownRequests: { FR: 'Consulter ses demandes', EN: 'View own requests', AR: 'عرض طلباته' },
  consult: { FR: 'Consulter', EN: 'View', AR: 'الاطلاع' },
  create: { FR: 'Creer', EN: 'Create', AR: 'إنشاء' },
  update: { FR: 'Modifier', EN: 'Edit', AR: 'تعديل' },
}

const roles = ref(Object.entries(roleTexts).map(([key, role]) => ({ key, ...role })))
const roleForm = reactive({ name: '', description: '' })
const isEditorOpen = ref(false)
const editingRoleIndex = ref(null)
const expandedRole = ref('')
const toastMessage = ref('')

const roleLabel = (role) => role.name?.[language.value] || role.name?.FR || role.name
const roleDescription = (role) => role.description?.[language.value] || role.description?.FR || role.description
const permissionLabel = (permission) => permissionTexts[permission]?.[language.value] || permission

function openCreateEditor() {
  editingRoleIndex.value = null
  roleForm.name = ''
  roleForm.description = ''
  isEditorOpen.value = true
}

function openEditEditor(role, index) {
  editingRoleIndex.value = index
  roleForm.name = roleLabel(role)
  roleForm.description = roleDescription(role)
  isEditorOpen.value = true
}

function closeEditor() {
  isEditorOpen.value = false
}

function saveRole() {
  const role = {
    key: `custom-${Date.now()}`,
    name: { [language.value]: roleForm.name.trim(), FR: roleForm.name.trim() },
    description: { [language.value]: roleForm.description.trim(), FR: roleForm.description.trim() },
    permissions: ['consult', 'create', 'update'],
  }

  if (editingRoleIndex.value === null) {
    roles.value.push(role)
    showToast(t.value.created)
  } else {
    roles.value[editingRoleIndex.value] = { ...roles.value[editingRoleIndex.value], ...role, key: roles.value[editingRoleIndex.value].key }
    showToast(t.value.updated)
  }

  closeEditor()
}

function deleteRole(index) {
  if (roles.value[index].key === 'superadmin') {
    showToast(t.value.protected)
    return
  }

  roles.value.splice(index, 1)
  showToast(t.value.deleted)
}

function togglePermissions(roleKey) {
  expandedRole.value = expandedRole.value === roleKey ? '' : roleKey
}

function resetPassword() {
  showToast(t.value.resetReady)
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
[dir='rtl'] .actions { justify-content: flex-start; }
.actions button, .danger-light { min-height: 36px; padding: 0 12px; border-radius: 10px; border: 1px solid #dfe5d6; background: white; color: #4a0a0a; font-weight: 900; cursor: pointer; }
.danger-light { margin-top: 14px; border-color: #ffd6d6; color: #e31e24; }
.mini-toast { position: fixed; right: 24px; bottom: 24px; z-index: 11000; padding: 13px 16px; border-radius: 14px; background: #4a0a0a; color: white; font-weight: 900; box-shadow: 0 18px 44px rgba(74,10,10,.22); }
[dir='rtl'] .mini-toast { right: auto; left: 24px; }
.toast-enter-active, .toast-leave-active { transition: .22s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(8px); }
@media (max-width: 1100px) { .role-editor { grid-template-columns: 1fr; } }
@media (max-width: 900px) { .role-list article { align-items: stretch; flex-direction: column; } .actions { justify-content: flex-start; } }
</style>

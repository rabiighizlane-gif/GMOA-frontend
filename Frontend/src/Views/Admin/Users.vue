<template>
  <main class="users-layout min-h-screen bg-slate-50 text-slate-800" :dir="language === 'AR' ? 'rtl' : 'ltr'">
    <button
      type="button"
      class="sidebar-toggle"
      :class="{ 'is-hidden': isSidebarOpen }"
      :aria-label="content.sidebarToggle"
      :aria-expanded="isSidebarOpen"
      @click="toggleSidebar"
    >
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </button>

    <div v-if="isSidebarOpen" class="sidebar-backdrop" aria-hidden="true" @click="closeSidebar"></div>
    <Sidebar :open="isSidebarOpen" @close="closeSidebar" />

    <section class="users-page">
      <header class="users-header">
        <div>
          <h1>{{ content.title }}</h1>
          <p>{{ content.subtitle }}</p>
        </div>

        <div class="users-header-actions">
          <button type="button" class="primary-button" @click="openCreateModal">
            <span aria-hidden="true">+</span>
            {{ content.addUser }}
          </button>
        </div>
      </header>

      <AdminTopControls v-model="searchQuery" />

      <div class="stats-grid">
        <article v-for="stat in stats" :key="stat.label" :class="stat.tone">
          <span>{{ stat.label }}</span>
          <strong>{{ stat.value }}</strong>
        </article>
      </div>

      <section class="users-panel">
        <div class="toolbar">
          <label>
            <span>{{ content.search }}</span>
            <input v-model="searchQuery" type="search" :placeholder="content.searchPlaceholder" />
          </label>

          <label>
            <span>{{ content.role }}</span>
            <select v-model="selectedRole">
              <option value="all">{{ content.allRoles }}</option>
              <option value="admin">{{ roleLabels.admin }}</option>
              <option value="technician">{{ roleLabels.technician }}</option>
              <option value="operator">{{ roleLabels.operator }}</option>
            </select>
          </label>

          <label>
            <span>{{ content.status }}</span>
            <select v-model="selectedStatus">
              <option value="all">{{ content.allStatuses }}</option>
              <option value="active">{{ content.active }}</option>
              <option value="pending">{{ content.pending }}</option>
              <option value="blocked">{{ content.blocked }}</option>
            </select>
          </label>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{{ content.user }}</th>
                <th>{{ content.role }}</th>
                <th>{{ content.department }}</th>
                <th>{{ content.status }}</th>
                <th>{{ content.lastLogin }}</th>
                <th>{{ content.actions }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id">
                <td>
                  <div class="user-cell">
                    <span :class="avatarTone(user.name)">{{ getInitials(user.name) }}</span>
                    <div>
                      <strong>{{ displayName(user.name) }}</strong>
                      <small>{{ user.email }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="role-pill" :class="user.role">{{ roleLabels[user.role] }}</span>
                </td>
                <td>{{ departmentLabel(user.department) }}</td>
                <td>
                  <span class="status-pill" :class="user.status">{{ statusLabel(user.status) }}</span>
                </td>
                <td>{{ displayDate(user.lastLogin) }}</td>
                <td>
                  <div class="actions">
                    <button type="button" @click="openUserProfile(user)">{{ content.view }}</button>
                    <button type="button" @click="openEditModal(user)">{{ content.edit }}</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>

    <div v-if="isUserModalOpen" class="modal-backdrop" @click.self="closeUserModal">
      <form class="user-modal" @submit.prevent="saveUser">
        <div class="modal-heading">
          <h2>{{ editingUserId ? content.edit : content.addUser }}</h2>
          <button type="button" class="modal-close" :aria-label="content.close" @click="closeUserModal">
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </button>
        </div>

        <label>
          <span>{{ content.fullName }}</span>
          <input v-model="newUser.name" type="text" required />
        </label>

        <label>
          <span>{{ content.email }}</span>
          <input v-model="newUser.email" type="email" required />
        </label>

        <label>
          <span>{{ content.role }}</span>
          <select v-model="newUser.role" @change="syncPermissionDefaults">
            <option value="admin">{{ roleLabels.admin }}</option>
            <option value="technician">{{ roleLabels.technician }}</option>
            <option value="operator">{{ roleLabels.operator }}</option>
          </select>
        </label>

        <label>
          <span>{{ content.department }}</span>
          <input v-model="newUser.department" type="text" required />
        </label>

        <section v-if="editingUserId" class="edit-permissions-panel">
          <h3>{{ pickText({ FR: 'Permissions', EN: 'Permissions', AR: 'الصلاحيات' }) }}</h3>
          <label v-for="permission in editablePermissions" :key="permission.key" class="permission-toggle">
            <span>{{ permission.label }}</span>
            <input v-model="permissionForm[permission.key]" type="checkbox" />
          </label>
        </section>

        <div class="modal-actions">
          <button type="button" class="secondary-button" @click="closeUserModal">{{ content.cancel }}</button>
          <button type="submit" class="primary-button">{{ content.save }}</button>
        </div>
      </form>
    </div>

    <div v-if="selectedUser" class="modal-backdrop" @click.self="closeUserProfile">
      <article class="user-profile-modal" :class="selectedUser.role">
        <button type="button" class="modal-close profile-close" :aria-label="content.close" @click="closeUserProfile">
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </button>

        <div class="user-profile-card">
          <div class="profile-identity-preview">
            <div class="profile-photo" :class="avatarTone(selectedUser.name)">
              {{ getInitials(displayName(selectedUser.name)) }}
            </div>
            <div>
              <span class="profile-kicker">{{ content.user }}</span>
              <h2>{{ displayName(selectedUser.name) }}</h2>
              <p>{{ roleLabels[selectedUser.role] }}</p>
            </div>
          </div>

          <div class="profile-info-list">
            <ul>
              <li>
                <span aria-hidden="true">✉</span>
                <strong>{{ selectedUser.email }}</strong>
              </li>
              <li>
                <span aria-hidden="true">☎</span>
                <strong>{{ selectedUser.phone || '+212 6 12 34 56 78' }}</strong>
              </li>
              <li>
                <span aria-hidden="true">⌖</span>
                <strong>{{ selectedUser.location || locationLabel }}</strong>
              </li>
              <li>
                <span aria-hidden="true">◎</span>
                <strong>{{ languageLabel }}</strong>
              </li>
              <li>
                <span aria-hidden="true">◷</span>
                <strong>GMT+1 (Europe/Casablanca)</strong>
              </li>
            </ul>
          </div>
        </div>

        <div class="profile-role-line">
          <span class="role-pill" :class="selectedUser.role">{{ roleLabels[selectedUser.role] }}</span>
          <span class="status-pill" :class="selectedUser.status">{{ statusLabel(selectedUser.status) }}</span>
        </div>

        <dl class="profile-detail-grid">
          <div>
            <dt>{{ content.fullName }}</dt>
            <dd>{{ displayName(selectedUser.name) }}</dd>
          </div>
          <div>
            <dt>{{ content.email }}</dt>
            <dd>{{ selectedUser.email }}</dd>
          </div>
          <div>
            <dt>{{ content.role }}</dt>
            <dd>{{ roleLabels[selectedUser.role] }}</dd>
          </div>
          <div>
            <dt>{{ content.department }}</dt>
            <dd>{{ departmentLabel(selectedUser.department) }}</dd>
          </div>
          <div>
            <dt>{{ content.status }}</dt>
            <dd>{{ statusLabel(selectedUser.status) }}</dd>
          </div>
          <div>
            <dt>{{ content.lastLogin }}</dt>
            <dd>{{ displayDate(selectedUser.lastLogin) }}</dd>
          </div>
        </dl>

        <section class="user-activity-card">
          <div class="activity-heading">
            <h3>{{ pickText({ FR: 'Activité récente', EN: 'Recent activity', AR: 'النشاط الأخير' }) }}</h3>
          </div>

          <ol class="user-activity-list">
            <li v-for="activity in userActivities(selectedUser)" :key="activity.title">
              <span class="activity-icon" :class="activity.tone" aria-hidden="true">{{ activity.icon }}</span>
              <div>
                <strong>{{ activity.title }}</strong>
                <small>{{ activity.time }}</small>
              </div>
              <span class="activity-dot" :class="activity.tone" aria-hidden="true"></span>
            </li>
          </ol>

          <button type="button" class="view-activity-button">
            {{ pickText({ FR: "Voir toute l'activité", EN: 'View all activity', AR: 'عرض كل النشاط' }) }}
          </button>
        </section>

        <section class="user-permissions-card">
          <div class="activity-heading">
            <h3>{{ pickText({ FR: 'Permissions', EN: 'Permissions', AR: 'الصلاحيات' }) }}</h3>
          </div>

          <ul class="permissions-mini-list">
            <li v-for="permission in userPermissions(selectedUser)" :key="permission.label">
              <span>{{ permission.label }}</span>
              <strong :class="{ denied: !permission.allowed }" aria-hidden="true">
                {{ permission.allowed ? '✓' : '×' }}
              </strong>
            </li>
          </ul>
        </section>
      </article>
    </div>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import AdminTopControls from '@/Components/AdminTopControls.vue'
import Sidebar from '@/Components/sidebar.vue'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()
const isSidebarOpen = ref(false)
const isUserModalOpen = ref(false)
const selectedUser = ref(null)
const editingUserId = ref(null)
const searchQuery = ref('')
const selectedRole = ref('all')
const selectedStatus = ref('all')
const permissionForm = ref({})
const users = ref([
  {
    id: 1,
    name: 'Ghizlane Rabii',
    email: 'ghizlane@smartcalyx.ma',
    role: 'admin',
    department: 'administration',
    status: 'active',
    lastLogin: '2026-07-16 15:30',
  },
  {
    id: 2,
    name: 'Ahmed El Mansouri',
    email: 'ahmed@smartcalyx.ma',
    role: 'technician',
    department: 'maintenance',
    status: 'active',
    lastLogin: '2026-07-16 12:10',
  },
  {
    id: 3,
    name: 'Nabil Amrani',
    email: 'nabil@smartcalyx.ma',
    role: 'operator',
    department: 'production',
    status: 'pending',
    lastLogin: '2026-07-15 18:22',
  },
  {
    id: 4,
    name: 'Youssef Berrada',
    email: 'youssef@smartcalyx.ma',
    role: 'technician',
    department: 'maintenance',
    status: 'blocked',
    lastLogin: '2026-07-10 09:42',
  },
])
const newUser = ref(createEmptyUser())

const language = computed(() => languageStore.language)

const pageContent = {
  FR: {
    sidebarToggle: 'Afficher le menu',
    title: 'Gestion des utilisateurs',
    subtitle: 'Ajoutez, filtrez et suivez les comptes de la plateforme.',
    addUser: 'Ajouter un utilisateur',
    search: 'Recherche',
    searchPlaceholder: 'Rechercher par nom ou e-mail...',
    role: 'Rôle',
    allRoles: 'Tous les rôles',
    status: 'Statut',
    allStatuses: 'Tous les statuts',
    active: 'Actif',
    pending: 'En attente',
    blocked: 'Bloqué',
    user: 'Utilisateur',
    department: 'Département',
    lastLogin: 'Dernière connexion',
    actions: 'Actions',
    view: 'Voir',
    edit: 'Modifier',
    close: 'Fermer',
    fullName: 'Nom complet',
    email: 'E-mail',
    cancel: 'Annuler',
    save: 'Enregistrer',
    totalUsers: 'Utilisateurs',
    activeUsers: 'Actifs',
    pendingUsers: 'En attente',
    blockedUsers: 'Bloqués',
  },
  EN: {
    sidebarToggle: 'Show menu',
    title: 'User management',
    subtitle: 'Add, filter, and monitor platform accounts.',
    addUser: 'Add user',
    search: 'Search',
    searchPlaceholder: 'Search by name or e-mail...',
    role: 'Role',
    allRoles: 'All roles',
    status: 'Status',
    allStatuses: 'All statuses',
    active: 'Active',
    pending: 'Pending',
    blocked: 'Blocked',
    user: 'User',
    department: 'Department',
    lastLogin: 'Last login',
    actions: 'Actions',
    view: 'View',
    edit: 'Edit',
    close: 'Close',
    fullName: 'Full name',
    email: 'E-mail',
    cancel: 'Cancel',
    save: 'Save',
    totalUsers: 'Users',
    activeUsers: 'Active',
    pendingUsers: 'Pending',
    blockedUsers: 'Blocked',
  },
  AR: {
    sidebarToggle: 'إظهار القائمة',
    title: 'إدارة المستخدمين',
    subtitle: 'إضافة الحسابات وتصفيتها ومتابعتها داخل المنصة.',
    addUser: 'إضافة مستخدم',
    search: 'البحث',
    searchPlaceholder: 'ابحث بالاسم أو البريد الإلكتروني...',
    role: 'الدور',
    allRoles: 'كل الأدوار',
    status: 'الحالة',
    allStatuses: 'كل الحالات',
    active: 'نشط',
    pending: 'في الانتظار',
    blocked: 'محظور',
    user: 'المستخدم',
    department: 'القسم',
    lastLogin: 'آخر دخول',
    actions: 'الإجراءات',
    view: 'عرض',
    edit: 'تعديل',
    close: 'إغلاق',
    fullName: 'الاسم الكامل',
    email: 'البريد الإلكتروني',
    cancel: 'إلغاء',
    save: 'حفظ',
    totalUsers: 'المستخدمون',
    activeUsers: 'نشطون',
    pendingUsers: 'في الانتظار',
    blockedUsers: 'محظورون',
  },
}

const content = computed(() => pageContent[language.value] || pageContent.FR)

const languageLabel = computed(() =>
  pickText({
    FR: 'Français',
    EN: 'English',
    AR: 'العربية',
  }),
)

const locationLabel = computed(() =>
  pickText({
    FR: 'Casablanca, Maroc',
    EN: 'Casablanca, Morocco',
    AR: 'الدار البيضاء، المغرب',
  }),
)

const roleLabels = computed(() => ({
  admin: pickText({ FR: 'Administratrice', EN: 'Administrator', AR: 'مديرة' }),
  technician: pickText({ FR: 'Technicien', EN: 'Technician', AR: 'تقني' }),
  operator: pickText({ FR: 'Opérateur', EN: 'Operator', AR: 'مشغل' }),
}))

const stats = computed(() => [
  { label: content.value.totalUsers, value: users.value.length, tone: 'total' },
  { label: content.value.activeUsers, value: users.value.filter((user) => user.status === 'active').length, tone: 'active' },
  { label: content.value.pendingUsers, value: users.value.filter((user) => user.status === 'pending').length, tone: 'pending' },
  { label: content.value.blockedUsers, value: users.value.filter((user) => user.status === 'blocked').length, tone: 'blocked' },
])

const filteredUsers = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return users.value.filter((user) => {
    const matchesSearch = !query || user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
    const matchesRole = selectedRole.value === 'all' || user.role === selectedRole.value
    const matchesStatus = selectedStatus.value === 'all' || user.status === selectedStatus.value

    return matchesSearch && matchesRole && matchesStatus
  })
})

const editablePermissions = computed(() => permissionDefinitions())

function pickText(texts) {
  return texts[language.value] || texts.FR
}

function departmentLabel(department) {
  const labels = {
    administration: {
      FR: 'Administration générale',
      EN: 'General administration',
      AR: 'الإدارة العامة',
    },
    maintenance: {
      FR: 'Maintenance',
      EN: 'Maintenance',
      AR: 'الصيانة',
    },
    production: {
      FR: 'Production',
      EN: 'Production',
      AR: 'الإنتاج',
    },
  }

  return labels[department]?.[language.value] || department
}

function normalizeDepartment(department) {
  const value = String(department || '').trim().toLowerCase()

  if (value.includes('admin') || value.includes('الإدارة')) return 'administration'
  if (value.includes('maintenance') || value.includes('صيانة')) return 'maintenance'
  if (value.includes('production') || value.includes('إنتاج')) return 'production'

  return department
}

function statusLabel(status) {
  return content.value[status] || status
}

function userActivities(user) {
  const commonTimes = {
    now: pickText({ FR: "Aujourd'hui à 08:42", EN: 'Today at 08:42', AR: 'اليوم على 08:42' }),
    morning: pickText({ FR: "Aujourd'hui à 08:15", EN: 'Today at 08:15', AR: 'اليوم على 08:15' }),
    yesterdayLate: pickText({ FR: 'Hier à 17:21', EN: 'Yesterday at 17:21', AR: 'أمس على 17:21' }),
    yesterdayMid: pickText({ FR: 'Hier à 16:48', EN: 'Yesterday at 16:48', AR: 'أمس على 16:48' }),
    yesterdayEarly: pickText({ FR: 'Hier à 15:33', EN: 'Yesterday at 15:33', AR: 'أمس على 15:33' }),
  }

  const activitiesByRole = {
    admin: [
      {
        icon: '↗',
        tone: 'blue',
        title: pickText({ FR: 'Connexion à la plateforme', EN: 'Signed in to the platform', AR: 'تسجيل الدخول إلى المنصة' }),
        time: commonTimes.now,
      },
      {
        icon: '⚙',
        tone: 'purple',
        title: pickText({ FR: 'Modification des permissions', EN: 'Updated permissions', AR: 'تعديل الصلاحيات' }),
        time: commonTimes.morning,
      },
      {
        icon: '▣',
        tone: 'slate',
        title: pickText({ FR: "Mise à jour d'un rapport", EN: 'Updated a report', AR: 'تحديث تقرير' }),
        time: commonTimes.yesterdayLate,
      },
      {
        icon: '✓',
        tone: 'green',
        title: pickText({ FR: "Validation d'une intervention", EN: 'Approved an intervention', AR: 'المصادقة على تدخل' }),
        time: commonTimes.yesterdayMid,
      },
      {
        icon: '!',
        tone: 'red',
        title: pickText({ FR: "Ajout d'une pièce de rechange", EN: 'Added a spare part', AR: 'إضافة قطعة غيار' }),
        time: commonTimes.yesterdayEarly,
      },
    ],
    technician: [
      {
        icon: '↗',
        tone: 'blue',
        title: pickText({ FR: 'Connexion à la plateforme', EN: 'Signed in to the platform', AR: 'تسجيل الدخول إلى المنصة' }),
        time: commonTimes.now,
      },
      {
        icon: '🔧',
        tone: 'purple',
        title: pickText({ FR: "Création d'une intervention", EN: 'Created an intervention', AR: 'إنشاء تدخل' }),
        time: commonTimes.morning,
      },
      {
        icon: '▣',
        tone: 'slate',
        title: pickText({ FR: "Mise à jour d'un rapport", EN: 'Updated a report', AR: 'تحديث تقرير' }),
        time: commonTimes.yesterdayLate,
      },
      {
        icon: '✓',
        tone: 'green',
        title: pickText({ FR: "Validation d'une intervention", EN: 'Validated an intervention', AR: 'تأكيد تدخل' }),
        time: commonTimes.yesterdayMid,
      },
      {
        icon: '!',
        tone: 'red',
        title: pickText({ FR: "Signalement d'une panne", EN: 'Reported a breakdown', AR: 'التبليغ عن عطل' }),
        time: commonTimes.yesterdayEarly,
      },
    ],
    operator: [
      {
        icon: '↗',
        tone: 'blue',
        title: pickText({ FR: 'Connexion à la plateforme', EN: 'Signed in to the platform', AR: 'تسجيل الدخول إلى المنصة' }),
        time: commonTimes.now,
      },
      {
        icon: '!',
        tone: 'red',
        title: pickText({ FR: "Signalement d'une panne", EN: 'Reported a breakdown', AR: 'التبليغ عن عطل' }),
        time: commonTimes.morning,
      },
      {
        icon: '▣',
        tone: 'slate',
        title: pickText({ FR: "Ajout d'une demande", EN: 'Added a request', AR: 'إضافة طلب' }),
        time: commonTimes.yesterdayLate,
      },
      {
        icon: '✓',
        tone: 'green',
        title: pickText({ FR: 'Clôture d’une demande', EN: 'Closed a request', AR: 'إغلاق طلب' }),
        time: commonTimes.yesterdayMid,
      },
      {
        icon: '↻',
        tone: 'purple',
        title: pickText({ FR: "Mise à jour de l'état machine", EN: 'Updated machine status', AR: 'تحديث حالة الآلة' }),
        time: commonTimes.yesterdayEarly,
      },
    ],
  }

  return activitiesByRole[user.role] || activitiesByRole.operator
}

function permissionDefinitions() {
  return [
    {
      key: 'viewMachines',
      label: pickText({ FR: 'Consulter les machines', EN: 'View machines', AR: 'عرض الآلات' }),
      roles: ['admin', 'technician', 'operator'],
    },
    {
      key: 'createIntervention',
      label: pickText({ FR: 'Créer une intervention', EN: 'Create an intervention', AR: 'إنشاء تدخل' }),
      roles: ['admin', 'technician'],
    },
    {
      key: 'editIntervention',
      label: pickText({ FR: 'Modifier les interventions', EN: 'Edit interventions', AR: 'تعديل التدخلات' }),
      roles: ['admin', 'technician'],
    },
    {
      key: 'validateIntervention',
      label: pickText({ FR: 'Valider les interventions', EN: 'Approve interventions', AR: 'المصادقة على التدخلات' }),
      roles: ['admin'],
    },
    {
      key: 'manageUsers',
      label: pickText({ FR: 'Gérer les utilisateurs', EN: 'Manage users', AR: 'إدارة المستخدمين' }),
      roles: ['admin'],
    },
    {
      key: 'editSettings',
      label: pickText({ FR: 'Modifier les paramètres', EN: 'Edit settings', AR: 'تعديل الإعدادات' }),
      roles: ['admin'],
    },
    {
      key: 'addReports',
      label: pickText({ FR: 'Ajouter des rapports', EN: 'Add reports', AR: 'إضافة تقارير' }),
      roles: ['admin', 'technician'],
    },
    {
      key: 'viewReports',
      label: pickText({ FR: 'Consulter les rapports', EN: 'View reports', AR: 'عرض التقارير' }),
      roles: ['admin', 'technician'],
    },
  ]
}

function defaultPermissionsForRole(role) {
  return permissionDefinitions().reduce((permissions, permission) => {
    permissions[permission.key] = permission.roles.includes(role)
    return permissions
  }, {})
}

function userPermissions(user) {
  const savedPermissions = user.permissions || defaultPermissionsForRole(user.role)

  return permissionDefinitions().map((permission) => ({
    ...permission,
    allowed: Boolean(savedPermissions[permission.key]),
  }))
}

function displayDate(date) {
  if (language.value === 'AR') {
    return date
      .replace('2026-07-16', '16 يوليو 2026')
      .replace('2026-07-15', '15 يوليو 2026')
      .replace('2026-07-10', '10 يوليو 2026')
  }

  if (language.value === 'EN') {
    return date
      .replace('2026-07-16', 'July 16, 2026')
      .replace('2026-07-15', 'July 15, 2026')
      .replace('2026-07-10', 'July 10, 2026')
  }

  return date
    .replace('2026-07-16', '16 juillet 2026')
    .replace('2026-07-15', '15 juillet 2026')
    .replace('2026-07-10', '10 juillet 2026')
}

function displayName(name) {
  if (language.value !== 'AR') return name

  const names = {
    'Ghizlane Rabii': 'غزلان ربيعي',
    'Ahmed El Mansouri': 'أحمد المنصوري',
    'Nabil Amrani': 'نبيل العمراني',
    'Youssef Berrada': 'يوسف برادة',
  }

  return names[name] || name
}

function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function avatarTone(name) {
  const tones = ['avatar-slate', 'avatar-indigo', 'avatar-teal', 'avatar-stone']
  const seed = String(name || '')
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), 0)

  return tones[seed % tones.length]
}

function createEmptyUser() {
  return {
    name: '',
    email: '',
    role: 'operator',
    department: '',
  }
}

function openCreateModal() {
  editingUserId.value = null
  permissionForm.value = {}
  newUser.value = createEmptyUser()
  isUserModalOpen.value = true
}

function openEditModal(user) {
  editingUserId.value = user.id
  newUser.value = {
    name: user.name,
    email: user.email,
    role: user.role,
    department: departmentLabel(user.department),
  }
  permissionForm.value = {
    ...defaultPermissionsForRole(user.role),
    ...(user.permissions || {}),
  }
  isUserModalOpen.value = true
}

function closeUserModal() {
  isUserModalOpen.value = false
  editingUserId.value = null
  permissionForm.value = {}
}

function openUserProfile(user) {
  selectedUser.value = user
}

function closeUserProfile() {
  selectedUser.value = null
}

function syncPermissionDefaults() {
  if (!editingUserId.value) return

  permissionForm.value = defaultPermissionsForRole(newUser.value.role)
}

function saveUser() {
  if (editingUserId.value) {
    const userIndex = users.value.findIndex((user) => user.id === editingUserId.value)

    if (userIndex !== -1) {
      users.value[userIndex] = {
        ...users.value[userIndex],
        ...newUser.value,
        department: normalizeDepartment(newUser.value.department),
        permissions: { ...permissionForm.value },
      }
    }

    closeUserModal()
    return
  }

  users.value.unshift({
    id: Date.now(),
    ...newUser.value,
    department: normalizeDepartment(newUser.value.department),
    status: 'pending',
    lastLogin: '2026-07-16 00:00',
  })
  closeUserModal()
}

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
  isSidebarOpen.value = false
}
</script>

<style scoped>
.users-layout {
  position: relative;
  min-height: 100vh;
  background:
    radial-gradient(circle at 22% 0%, rgba(77, 126, 172, 0.16), transparent 28%),
    linear-gradient(180deg, #111927 0%, #101822 46%, #0d1520 100%);
  color: #f4f7fb;
}

.users-page {
  min-height: 100vh;
  padding: 24px 28px 34px 88px;
}

[dir='rtl'] .users-page {
  padding-right: 88px;
  padding-left: 28px;
}

.users-header {
  display: none;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 16px;
}

.users-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.users-header h1 {
  margin: 0;
  color: #4a0a0a;
  font-size: 30px;
  font-weight: 900;
}

.users-header p {
  margin: 6px 0 0;
  color: rgba(74, 10, 10, 0.66);
  font-size: 15px;
  font-weight: 650;
}

.primary-button,
.secondary-button {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 12px;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
}

.primary-button {
  background: #6a9a2a;
  color: #f7f9f3;
}

.secondary-button {
  background: #f7f9f3;
  color: #4a0a0a;
}

.users-page :deep(.admin-top-controls) {
  margin-bottom: 18px;
}

.users-page :deep(.search-control) {
  width: min(100%, 340px);
}

.users-page :deep(.search-control input),
.users-page :deep(.notification-control),
.users-page :deep(.date-control),
.users-page :deep(.time-control),
.users-page :deep(.live-control),
.users-page :deep(.language-button) {
  min-height: 42px;
  border: 1px solid rgba(126, 146, 170, 0.24);
  border-radius: 14px;
  background: rgba(19, 29, 42, 0.9);
  color: #f5f8fc;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 12px 28px rgba(0, 0, 0, 0.2);
}

.users-page :deep(.search-control input) {
  height: 42px;
  color: #dbe4ef;
  font-size: 13px;
}

.users-page :deep(.search-control input::placeholder) {
  color: #8795a7;
}

.users-page :deep(.search-control span) {
  color: #5b9bd7;
}

.users-page :deep(.live-control) {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0 16px;
  color: #f4d96a;
}

.users-page :deep(.language-button) {
  height: 42px;
  min-width: 86px;
  font-size: 13px;
  color: #f4f7fb;
}

.users-page :deep(.language-menu) {
  border-color: rgba(126, 146, 170, 0.24);
  border-radius: 12px;
  background: #121c28;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.34);
}

.users-page :deep(.language-menu button) {
  color: #e7edf5;
}

.users-page :deep(.language-menu button:hover) {
  background: rgba(75, 153, 212, 0.16);
  color: #cfe9ff;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 12px;
  margin-bottom: 16px;
}

.stats-grid article,
.users-panel {
  border: 1px solid rgba(var(--panel-rgb, 105, 155, 79), 0.58);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(var(--panel-rgb, 105, 155, 79), 0.13), rgba(var(--panel-rgb, 105, 155, 79), 0.04)),
    rgba(18, 28, 39, 0.84);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 18px 40px rgba(0, 0, 0, 0.24);
}

.stats-grid article {
  position: relative;
  overflow: hidden;
  display: grid;
  gap: 8px;
  min-height: 82px;
  padding: 18px 18px 16px;
}

.stats-grid article::before {
  display: none;
}

.stats-grid article::after {
  content: '';
  position: absolute;
  top: 18px;
  right: 18px;
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: var(--stat-color, #b6c65b);
  box-shadow: 0 0 0 5px var(--stat-soft, rgba(182, 198, 91, 0.18)), 0 0 18px var(--stat-color, #b6c65b);
}

[dir='rtl'] .stats-grid article::after {
  right: auto;
  left: 18px;
}

.stats-grid article.total {
  --stat-color: #83b95c;
  --stat-soft: rgba(131, 185, 92, 0.15);
  --panel-rgb: 131, 185, 92;
}

.stats-grid article.active {
  --stat-color: #e4ab44;
  --stat-soft: rgba(228, 171, 68, 0.15);
  --panel-rgb: 228, 171, 68;
}

.stats-grid article.pending {
  --stat-color: #4b99d4;
  --stat-soft: rgba(75, 153, 212, 0.15);
  --panel-rgb: 75, 153, 212;
}

.stats-grid article.blocked {
  --stat-color: #dc3747;
  --stat-soft: rgba(220, 55, 71, 0.15);
  --panel-rgb: 220, 55, 71;
}

.stats-grid span {
  color: #b8c3d2;
  font-size: 12px;
  font-weight: 850;
}

.stats-grid strong {
  color: var(--stat-color, #4a0a0a);
  font-size: 27px;
  font-weight: 950;
}

.users-panel {
  overflow: hidden;
  --panel-rgb: 112, 129, 150;
  border-color: rgba(116, 135, 158, 0.28);
  background: rgba(17, 27, 38, 0.9);
}

.toolbar {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) 180px 180px;
  gap: 12px;
  padding: 18px 20px;
  border-bottom: 1px solid rgba(116, 135, 158, 0.18);
}

.toolbar label,
.user-modal label {
  display: grid;
  gap: 7px;
  color: #a9b6c5;
  font-size: 12px;
  font-weight: 850;
}

.toolbar input,
.toolbar select,
.user-modal input,
.user-modal select {
  height: 38px;
  width: 100%;
  border: 1px solid rgba(117, 136, 158, 0.24);
  border-radius: 8px;
  background: #0d1520;
  padding: 0 12px;
  color: #f4f7fb;
  font-size: 13px;
  font-weight: 700;
  outline: none;
}

.toolbar input::placeholder {
  color: #738197;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 13px 18px;
  border-bottom: 1px solid rgba(116, 135, 158, 0.15);
  text-align: start;
  vertical-align: middle;
}

th {
  background: rgba(43, 55, 68, 0.72);
  color: #aeb9c8;
  font-size: 11px;
  font-weight: 950;
  line-height: 1.2;
  text-transform: uppercase;
}

th:last-child,
td:last-child {
  text-align: center;
}

td {
  color: #f4f7fb;
  font-size: 13px;
  font-weight: 750;
}

tbody tr {
  background: rgba(17, 27, 38, 0.8);
}

tbody tr:hover {
  background: rgba(35, 49, 64, 0.92);
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-cell > span {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 950;
}

.avatar-slate {
  background: rgba(148, 163, 184, 0.2);
  color: #e6edf6;
}

.avatar-indigo {
  background: rgba(131, 185, 92, 0.18);
  color: #e5f5d8;
}

.avatar-teal {
  background: rgba(75, 153, 212, 0.18);
  color: #dcefff;
}

.avatar-stone {
  background: rgba(228, 171, 68, 0.18);
  color: #fff0cf;
}

.user-cell strong,
.user-cell small {
  display: block;
}

.user-cell small {
  margin-top: 3px;
  color: #8d9aab;
  font-size: 11px;
}

.status-pill {
  display: inline-flex;
  min-height: 26px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 5px 10px;
  font-size: 11px;
  font-weight: 900;
  line-height: 1.1;
  white-space: nowrap;
}

.role-pill {
  display: inline-flex;
  min-height: 26px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 5px 10px;
  font-size: 11px;
  font-weight: 950;
  line-height: 1.1;
  white-space: nowrap;
}

.role-pill.admin {
  border: 1px solid rgba(131, 185, 92, 0.46);
  background: rgba(131, 185, 92, 0.16);
  color: #bce39d;
}

.role-pill.technician {
  border: 1px solid rgba(228, 171, 68, 0.46);
  background: rgba(228, 171, 68, 0.16);
  color: #ffd98a;
}

.role-pill.operator {
  border: 1px solid rgba(220, 55, 71, 0.46);
  background: rgba(220, 55, 71, 0.16);
  color: #ff9ca7;
}

.status-pill.active {
  background: rgba(131, 185, 92, 0.18);
  color: #aada85;
}

.status-pill.pending {
  background: rgba(228, 171, 68, 0.17);
  color: #ffd27b;
}

.status-pill.blocked {
  background: rgba(220, 55, 71, 0.16);
  color: #ff7f8e;
}

.actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.actions button {
  min-height: 28px;
  border: 1px solid rgba(210, 221, 234, 0.42);
  border-radius: 8px;
  background: rgba(13, 21, 32, 0.86);
  color: #f2f6fb;
  padding: 0 10px;
  font-size: 11px;
  font-weight: 900;
  cursor: pointer;
}

.actions button:hover {
  border-color: rgba(91, 155, 215, 0.72);
  color: #cfe9ff;
}

.sidebar-toggle {
  position: fixed;
  top: 22px;
  left: 22px;
  z-index: 50;
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;
  border: 1px solid rgba(126, 146, 170, 0.22);
  border-radius: 12px;
  background: rgba(28, 40, 54, 0.9);
  color: #d9e4ef;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.24);
}

[dir='rtl'] .sidebar-toggle {
  right: 24px;
  left: auto;
}

.sidebar-toggle.is-hidden {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.sidebar-toggle span {
  width: 22px;
  height: 2px;
  border-radius: 999px;
  background: currentColor;
}

.sidebar-backdrop,
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 35;
  background: rgba(5, 10, 18, 0.56);
  backdrop-filter: blur(3px);
}

.modal-backdrop {
  z-index: 70;
  display: grid;
  align-items: start;
  justify-items: center;
  padding: 48px 20px;
  overflow-y: auto;
}

.user-modal {
  width: min(100%, 460px);
  max-height: calc(100vh - 96px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.42) transparent;
  -webkit-overflow-scrolling: touch;
  display: grid;
  gap: 14px;
  border: 1px solid rgba(126, 146, 170, 0.24);
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgba(31, 43, 57, 0.98), rgba(16, 25, 36, 0.98)),
    #101924;
  padding: 22px;
  color: #f4f7fb;
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.52);
}

.user-profile-modal {
  --role-color: #83b95c;
  --role-soft: rgba(131, 185, 92, 0.16);
  position: relative;
  width: min(100%, 700px);
  max-height: calc(100vh - 96px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.42) transparent;
  -webkit-overflow-scrolling: touch;
  border: 1px solid rgba(126, 146, 170, 0.24);
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgba(31, 43, 57, 0.98), rgba(16, 25, 36, 0.98)),
    #101924;
  color: #f4f7fb;
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.52);
}

.user-profile-modal::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.user-modal::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.user-profile-modal::-webkit-scrollbar-thumb,
.user-modal::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(79, 125, 32, 0.38);
}

.user-profile-modal::-webkit-scrollbar-track,
.user-modal::-webkit-scrollbar-track {
  background: transparent;
}

.user-profile-modal::before {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: 6px;
  background: var(--role-color);
}

.user-profile-modal.admin {
  --role-color: #83b95c;
  --role-soft: rgba(131, 185, 92, 0.16);
}

.user-profile-modal.technician {
  --role-color: #e4ab44;
  --role-soft: rgba(228, 171, 68, 0.16);
}

.user-profile-modal.operator {
  --role-color: #dc3747;
  --role-soft: rgba(220, 55, 71, 0.16);
}

.profile-close {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2;
  border-color: rgba(210, 221, 234, 0.28);
  background: rgba(13, 21, 32, 0.88);
  color: #e6edf6;
}

[dir='rtl'] .profile-close {
  right: auto;
  left: 16px;
}

.user-profile-card {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  align-items: stretch;
  padding: 30px 24px 16px;
  background:
    linear-gradient(180deg, var(--role-soft), rgba(16, 25, 36, 0) 66%),
    transparent;
  color: #f4f7fb;
}

.profile-identity-preview {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  border: 1px solid rgba(126, 146, 170, 0.22);
  border-radius: 12px;
  background: rgba(22, 32, 44, 0.82);
  padding: 18px;
  text-align: start;
}

.profile-photo {
  width: 72px;
  height: 72px;
  flex: 0 0 72px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 4px solid var(--role-color);
  border-radius: 50%;
  background: rgba(13, 21, 32, 0.88);
  color: #f4f7fb;
  font-size: 21px;
  font-weight: 950;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.34), 0 0 24px rgba(131, 185, 92, 0.16);
}

.profile-kicker {
  display: inline-flex;
  min-height: 26px;
  align-items: center;
  border-radius: 999px;
  background: var(--role-soft);
  padding: 0 10px;
  color: #dce7ef;
  font-size: 11px;
  font-weight: 950;
  text-transform: uppercase;
}

.profile-identity-preview h2 {
  margin: 7px 0 4px;
  color: #f8fbff;
  font-size: 22px;
  font-weight: 950;
}

.profile-identity-preview p {
  margin: 0;
  color: #aab7c7;
  font-size: 15px;
  font-weight: 850;
}

.profile-info-list ul {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
  color: #f4f7fb;
}

.profile-info-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  border: 1px solid rgba(126, 146, 170, 0.2);
  border-radius: 12px;
  background: rgba(13, 21, 32, 0.62);
  padding: 11px 12px;
  font-size: 13px;
  font-weight: 850;
}

.profile-info-list li span {
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--role-soft);
  color: #f4f7fb;
  font-size: 17px;
  line-height: 1;
}

.profile-info-list li strong {
  min-width: 0;
  font-weight: 850;
  overflow-wrap: anywhere;
}

.profile-role-line {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 0 24px 16px;
  background: transparent;
}

.profile-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
  padding: 0 24px 24px;
  background: transparent;
}

.profile-detail-grid div {
  min-width: 0;
  border: 1px solid rgba(126, 146, 170, 0.2);
  border-radius: 12px;
  background: rgba(22, 32, 44, 0.72);
  padding: 12px 14px;
}

.profile-detail-grid dt {
  color: #aab7c7;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
}

.profile-detail-grid dd {
  margin: 6px 0 0;
  color: #f4f7fb;
  font-size: 14px;
  font-weight: 900;
  word-break: break-word;
}

.user-activity-card,
.user-permissions-card {
  margin: 0 24px 24px;
  border: 1px solid rgba(126, 146, 170, 0.2);
  border-radius: 12px;
  background: rgba(17, 27, 38, 0.82);
  overflow: hidden;
}

.activity-heading {
  padding: 16px 18px 10px;
}

.activity-heading h3 {
  margin: 0;
  color: #f4f7fb;
  font-size: 15px;
  font-weight: 950;
}

.user-activity-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.user-activity-list li {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) 12px;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  border-top: 1px solid rgba(126, 146, 170, 0.16);
}

.activity-icon {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 950;
}

.activity-icon.blue {
  background: rgba(75, 153, 212, 0.18);
  color: #8fcaff;
}

.activity-icon.purple {
  background: rgba(131, 185, 92, 0.18);
  color: #bce39d;
}

.activity-icon.slate {
  background: rgba(148, 163, 184, 0.18);
  color: #e2e8f0;
}

.activity-icon.green {
  background: rgba(131, 185, 92, 0.18);
  color: #bce39d;
}

.activity-icon.red {
  background: rgba(220, 55, 71, 0.18);
  color: #ff9ca7;
}

.user-activity-list strong,
.user-activity-list small {
  display: block;
}

.user-activity-list strong {
  color: #f4f7fb;
  font-size: 12px;
  font-weight: 900;
}

.user-activity-list small {
  margin-top: 2px;
  color: #8d9aab;
  font-size: 11px;
  font-weight: 750;
}

.activity-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #83b95c;
}

.activity-dot.blue {
  background: #4b99d4;
}

.activity-dot.purple {
  background: #83b95c;
}

.activity-dot.slate {
  background: #94a3b8;
}

.activity-dot.green {
  background: #83b95c;
}

.activity-dot.red {
  background: #dc3747;
}

.view-activity-button {
  width: calc(100% - 36px);
  min-height: 38px;
  margin: 10px 18px 16px;
  border: 1px solid rgba(210, 221, 234, 0.28);
  border-radius: 8px;
  background: rgba(13, 21, 32, 0.82);
  color: #f2f6fb;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
}

.view-activity-button:hover {
  border-color: rgba(91, 155, 215, 0.72);
  background: rgba(24, 38, 53, 0.92);
  color: #cfe9ff;
}

.permissions-mini-list {
  display: grid;
  gap: 0;
  margin: 0;
  padding: 0 18px 16px;
  list-style: none;
}

.permissions-mini-list li {
  min-height: 34px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  border-top: 1px solid rgba(126, 146, 170, 0.16);
  color: #f4f7fb;
  font-size: 12px;
  font-weight: 850;
}

.permissions-mini-list strong {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #83b95c;
  color: #ffffff;
  font-size: 12px;
  font-weight: 950;
  line-height: 1;
}

.permissions-mini-list strong.denied {
  background: #dc3747;
}

.modal-heading {
  display: flex;
  justify-content: space-between;
  gap: 14px;
}

.modal-heading h2 {
  margin: 0;
  color: #f8fbff;
  font-size: 22px;
  font-weight: 900;
}

.modal-close {
  position: relative;
  width: 36px;
  height: 36px;
  border: 1px solid rgba(210, 221, 234, 0.28);
  border-radius: 10px;
  background: rgba(13, 21, 32, 0.88);
  color: #e6edf6;
  cursor: pointer;
}

.modal-close span {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 16px;
  height: 2px;
  border-radius: 999px;
  background: currentColor;
}

.modal-close span:first-child {
  transform: translate(-50%, -50%) rotate(45deg);
}

.modal-close span:last-child {
  transform: translate(-50%, -50%) rotate(-45deg);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.edit-permissions-panel {
  display: grid;
  gap: 8px;
  border: 1px solid rgba(126, 146, 170, 0.2);
  border-radius: 12px;
  background: rgba(17, 27, 38, 0.82);
  padding: 14px;
}

.edit-permissions-panel h3 {
  margin: 0 0 4px;
  color: #f4f7fb;
  font-size: 14px;
  font-weight: 950;
}

.permission-toggle {
  min-height: 34px;
  display: flex !important;
  grid-template-columns: none !important;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #f4f7fb !important;
  font-size: 12px !important;
  font-weight: 850 !important;
}

.permission-toggle input {
  width: 18px !important;
  height: 18px !important;
  accent-color: #83b95c;
}

:global(:root[data-theme='dark']) .users-layout {
  background: #0f172a;
  color: #f1f5f9;
}

:global(:root[data-theme='dark']) .users-header h1,
:global(:root[data-theme='dark']) .stats-grid strong,
:global(:root[data-theme='dark']) td,
:global(:root[data-theme='dark']) .modal-heading h2 {
  color: #f1f5f9;
}

:global(:root[data-theme='dark']) .users-header p,
:global(:root[data-theme='dark']) th,
:global(:root[data-theme='dark']) .stats-grid span,
:global(:root[data-theme='dark']) .toolbar label,
:global(:root[data-theme='dark']) .user-modal label,
:global(:root[data-theme='dark']) .user-cell small {
  color: #94a3b8;
}

:global(:root[data-theme='dark']) .stats-grid article,
:global(:root[data-theme='dark']) .users-panel,
:global(:root[data-theme='dark']) .user-modal,
:global(:root[data-theme='dark']) .user-profile-modal,
:global(:root[data-theme='dark']) .edit-permissions-panel {
  border-color: rgba(51, 65, 85, 0.72);
  background: #1e293b !important;
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.32);
}

:global(:root[data-theme='dark']) .stats-grid article::before {
  opacity: 0.9;
}

:global(:root[data-theme='dark']) .stats-grid article::after {
  box-shadow: 0 0 0 7px rgba(148, 163, 184, 0.1);
}

:global(:root[data-theme='dark']) .toolbar,
:global(:root[data-theme='dark']) thead,
:global(:root[data-theme='dark']) tr {
  background: transparent;
}

:global(:root[data-theme='dark']) tbody tr:hover {
  background: rgba(148, 163, 184, 0.06);
}

:global(:root[data-theme='dark']) .toolbar input,
:global(:root[data-theme='dark']) .toolbar select,
:global(:root[data-theme='dark']) .user-modal input,
:global(:root[data-theme='dark']) .user-modal select {
  border-color: #334155 !important;
  background: #0f172a !important;
  color: #e2e8f0 !important;
}

:global(:root[data-theme='dark']) .toolbar input::placeholder {
  color: #64748b !important;
}

:global(:root[data-theme='dark']) .actions button,
:global(:root[data-theme='dark']) .secondary-button {
  border: 1px solid rgba(71, 85, 105, 0.82);
  background: rgba(15, 23, 42, 0.62);
  color: #cbd5e1;
}

:global(:root[data-theme='dark']) .actions button:hover,
:global(:root[data-theme='dark']) .secondary-button:hover {
  border-color: #64748b;
  background: rgba(30, 41, 59, 0.95);
  color: #f1f5f9;
}

:global(:root[data-theme='dark']) .sidebar-toggle,
:global(:root[data-theme='dark']) .modal-close {
  border-color: #334155;
  background: #1e293b;
  color: #f1f5f9;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
}

:global(:root[data-theme='dark']) .profile-detail-grid div {
  border-color: rgba(51, 65, 85, 0.72);
  background: #0f172a;
}

:global(:root[data-theme='dark']) .profile-detail-grid,
:global(:root[data-theme='dark']) .profile-role-line {
  background: #1e293b;
}

:global(:root[data-theme='dark']) .user-profile-card {
  background:
    linear-gradient(180deg, rgba(148, 163, 184, 0.08), rgba(30, 41, 59, 0) 62%),
    #1e293b;
}

:global(:root[data-theme='dark']) .profile-identity-preview,
:global(:root[data-theme='dark']) .profile-info-list li,
:global(:root[data-theme='dark']) .user-activity-card,
:global(:root[data-theme='dark']) .user-permissions-card {
  border-color: rgba(51, 65, 85, 0.72);
  background: #0f172a;
}

:global(:root[data-theme='dark']) .profile-identity-preview h2,
:global(:root[data-theme='dark']) .profile-info-list li strong,
:global(:root[data-theme='dark']) .activity-heading h3,
:global(:root[data-theme='dark']) .user-activity-list strong,
:global(:root[data-theme='dark']) .permissions-mini-list li,
:global(:root[data-theme='dark']) .edit-permissions-panel h3,
:global(:root[data-theme='dark']) .permission-toggle {
  color: #f1f5f9;
}

:global(:root[data-theme='dark']) .profile-identity-preview p {
  color: #cbd5e1;
}

:global(:root[data-theme='dark']) .profile-detail-grid dd {
  color: #f1f5f9;
}

:global(:root[data-theme='dark']) .profile-detail-grid dt {
  color: #94a3b8;
}

:global(:root[data-theme='dark']) .user-activity-list li {
  border-top-color: rgba(51, 65, 85, 0.72);
}

:global(:root[data-theme='dark']) .permissions-mini-list li {
  border-top-color: rgba(51, 65, 85, 0.72);
}

:global(:root[data-theme='dark']) .user-activity-list small {
  color: #94a3b8;
}

:global(:root[data-theme='dark']) .view-activity-button {
  border-color: #334155;
  background: #1e293b;
  color: #cbd5e1;
}

:global(:root[data-theme='dark']) .status-pill.active {
  border: 1px solid rgba(16, 185, 129, 0.2);
  background: rgba(16, 185, 129, 0.1);
  color: #34d399;
}

:global(:root[data-theme='dark']) .status-pill.pending {
  border: 1px solid rgba(245, 158, 11, 0.2);
  background: rgba(245, 158, 11, 0.1);
  color: #fbbf24;
}

:global(:root[data-theme='dark']) .status-pill.blocked {
  border: 1px solid rgba(244, 63, 94, 0.2);
  background: rgba(244, 63, 94, 0.1);
  color: #fb7185;
}

:global(:root[data-theme='dark']) .role-pill.admin {
  border: 1px solid rgba(16, 185, 129, 0.2);
  background: rgba(16, 185, 129, 0.1);
  color: #34d399;
}

:global(:root[data-theme='dark']) .role-pill.technician {
  border: 1px solid rgba(245, 158, 11, 0.2);
  background: rgba(245, 158, 11, 0.1);
  color: #fbbf24;
}

:global(:root[data-theme='dark']) .role-pill.operator {
  border: 1px solid rgba(244, 63, 94, 0.2);
  background: rgba(244, 63, 94, 0.1);
  color: #fb7185;
}

:global(:root[data-theme='dark']) .avatar-slate {
  background: #334155;
  color: #e2e8f0;
}

:global(:root[data-theme='dark']) .avatar-indigo {
  background: rgba(16, 185, 129, 0.12);
  color: #6ee7b7;
}

:global(:root[data-theme='dark']) .avatar-teal {
  background: rgba(245, 158, 11, 0.12);
  color: #fcd34d;
}

:global(:root[data-theme='dark']) .avatar-stone {
  background: rgba(244, 63, 94, 0.12);
  color: #fda4af;
}

:global(:root[data-theme='dark']) .stats-grid article {
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.26);
}

:global(:root[data-theme='dark']) th,
:global(:root[data-theme='dark']) td,
:global(:root[data-theme='dark']) .toolbar {
  border-color: rgba(51, 65, 85, 0.72);
}

:global(:root[data-theme='light']) .users-layout {
  background: #f7f9f3;
  color: #4a0a0a;
}

:global(:root[data-theme='light']) .users-header h1 {
  color: #4a0a0a;
}

:global(:root[data-theme='light']) .users-header p,
:global(:root[data-theme='light']) .toolbar label,
:global(:root[data-theme='light']) .user-cell small {
  color: rgba(74, 10, 10, 0.62);
}

:global(:root[data-theme='light']) .users-page :deep(.search-control input) {
  background: #ffffff;
  border-color: rgba(74, 10, 10, 0.1);
  color: #4a0a0a;
}

:global(:root[data-theme='light']) .users-page :deep(.search-control input::placeholder) {
  color: rgba(74, 10, 10, 0.5);
}

:global(:root[data-theme='light']) .users-page :deep(.notification-control),
:global(:root[data-theme='light']) .users-page :deep(.date-control),
:global(:root[data-theme='light']) .users-page :deep(.time-control),
:global(:root[data-theme='light']) .users-page :deep(.language-button),
:global(:root[data-theme='light']) .users-page :deep(.live-control) {
  background: #4a0a0a;
  border-color: rgba(74, 10, 10, 0.2);
  color: #f7f9f3;
  box-shadow: 0 12px 28px rgba(74, 10, 10, 0.16);
}

:global(:root[data-theme='light']) .users-page :deep(.live-control) {
  color: #e8b300;
}

:global(:root[data-theme='light']) .users-page :deep(.language-menu) {
  background: #4a0a0a;
  border-color: rgba(247, 249, 243, 0.16);
}

:global(:root[data-theme='light']) .users-page :deep(.language-menu button) {
  color: #f7f9f3;
}

:global(:root[data-theme='light']) .stats-grid article,
:global(:root[data-theme='light']) .users-panel {
  border-color: rgba(74, 10, 10, 0.12);
  background:
    linear-gradient(135deg, rgba(247, 249, 243, 0.1), rgba(247, 249, 243, 0)),
    #4a0a0a;
  box-shadow: 0 18px 42px rgba(74, 10, 10, 0.16);
}

:global(:root[data-theme='light']) .stats-grid article.total {
  border-color: rgba(106, 154, 42, 0.45);
}

:global(:root[data-theme='light']) .stats-grid article.active {
  border-color: rgba(255, 106, 0, 0.45);
}

:global(:root[data-theme='light']) .stats-grid article.pending {
  background: #fff4cf;
  border-color: rgba(232, 179, 0, 0.38);
}

:global(:root[data-theme='light']) .stats-grid article.blocked {
  border-color: rgba(227, 30, 36, 0.45);
}

:global(:root[data-theme='light']) .stats-grid span,
:global(:root[data-theme='light']) th {
  color: rgba(247, 249, 243, 0.72);
}

:global(:root[data-theme='light']) .stats-grid strong,
:global(:root[data-theme='light']) td,
:global(:root[data-theme='light']) .user-cell strong {
  color: #f7f9f3;
}

:global(:root[data-theme='light']) .stats-grid article.pending span {
  color: rgba(74, 10, 10, 0.62);
}

:global(:root[data-theme='light']) .stats-grid article.pending strong {
  color: #4f83b8;
}

:global(:root[data-theme='light']) .toolbar,
:global(:root[data-theme='light']) thead {
  border-color: rgba(247, 249, 243, 0.12);
  background: rgba(74, 10, 10, 0.18);
}

:global(:root[data-theme='light']) .toolbar input,
:global(:root[data-theme='light']) .toolbar select {
  background: #ffffff;
  border-color: rgba(74, 10, 10, 0.1);
  color: #4a0a0a;
}

:global(:root[data-theme='light']) .toolbar input::placeholder {
  color: rgba(74, 10, 10, 0.5);
}

:global(:root[data-theme='light']) th,
:global(:root[data-theme='light']) td {
  border-color: rgba(247, 249, 243, 0.12);
}

:global(:root[data-theme='light']) tbody tr:hover {
  background: rgba(247, 249, 243, 0.06);
}

:global(:root[data-theme='light']) .actions button {
  background: #f7f9f3;
  border-color: rgba(74, 10, 10, 0.12);
  color: #4a0a0a;
}

:global(:root[data-theme='light']) .actions button:hover {
  border-color: rgba(106, 154, 42, 0.45);
  color: #6a9a2a;
}

:global(:root[data-theme='light']) .sidebar-toggle,
:global(:root[data-theme='light']) .modal-close {
  background: #f7f9f3;
  border-color: rgba(74, 10, 10, 0.1);
  color: #4a0a0a;
  box-shadow: 0 12px 28px rgba(74, 10, 10, 0.1);
}

@media (max-width: 900px) {
  .users-page {
    padding: 88px 16px 32px;
  }

  [dir='rtl'] .users-page {
    padding: 88px 16px 32px;
  }

  .users-header {
    flex-direction: column;
  }

  .users-header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .stats-grid,
  .toolbar,
  .profile-detail-grid {
    grid-template-columns: 1fr;
  }

  .user-profile-card {
    grid-template-columns: 1fr;
    align-items: flex-start;
    padding: 28px 22px;
  }

  .profile-info-list li {
    font-size: 17px;
  }

  .profile-info-list ul {
    grid-template-columns: 1fr;
  }

  .profile-identity-preview {
    align-items: flex-start;
    flex-direction: column;
  }

  .profile-role-line,
  .profile-detail-grid,
  .user-activity-card,
  .user-permissions-card {
    padding-inline: 22px;
  }

  .user-activity-card,
  .user-permissions-card {
    margin-inline: 22px;
  }
}
</style>

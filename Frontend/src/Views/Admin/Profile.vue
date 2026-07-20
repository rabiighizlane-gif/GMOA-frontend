<template>
  <main
    class="profile-layout min-h-screen bg-[#f7f9f3] text-slate-900"
    :class="{ 'theme-dark': preferenceSettings.theme === 'Sombre' }"
    :dir="language === 'AR' ? 'rtl' : 'ltr'"
  >
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

    <section class="profile-page">
      <AdminTopControls v-model="profileSearch" class="profile-top-controls" />

      <article class="profile-card">
        <div class="profile-info">
          <ul>
            <li v-for="item in infoItems" :key="item.key">
              <span class="info-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path v-for="path in getIconPaths(item.icon)" :key="path" :d="path" />
                </svg>
              </span>
              <span>{{ item.value }}</span>
            </li>
          </ul>

          <button class="edit-profile" type="button" @click="openEditor">
            <span class="edit-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path v-for="path in getIconPaths('edit')" :key="path" :d="path" />
              </svg>
            </span>
            {{ content.editProfile }}
          </button>
        </div>

        <div class="profile-identity">
          <div class="photo-frame">
            <img :src="profile.image" :alt="profile.name" @error="useFallbackImage" />
          </div>
          <h1>{{ profile.name }}</h1>
          <p>{{ profile.role }}</p>
          <div class="status-line">
            <span aria-hidden="true"></span>
            {{ content.activeAccount }}
          </div>
        </div>
      </article>

      <nav class="profile-tabs" :aria-label="content.profileSections">
        <button
          v-for="section in sections"
          :key="section.key"
          type="button"
          :class="{ active: activeSection === section.key }"
          @click="selectSection(section.key)"
        >
          <span class="section-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path v-for="path in getIconPaths(section.icon)" :key="path" :d="path" />
            </svg>
          </span>
          <span>{{ section.label }}</span>
        </button>
      </nav>

      <section v-if="activeSection === 'information'" class="professional-panel">
        <div class="professional-heading">
          <h2>{{ content.professionalInfo }}</h2>
          <button type="button" @click="openEditor">{{ content.edit }}</button>
        </div>

        <dl class="professional-list">
          <div v-for="item in professionalItems" :key="item.label">
            <dt>{{ item.label }}</dt>
            <dd>{{ item.value }}</dd>
          </div>
        </dl>
      </section>

      <section v-if="activeSection === 'permissions'" class="professional-panel permissions-panel">
        <div class="professional-heading">
          <h2>{{ content.permissionsTitle }}</h2>
        </div>

        <p class="permissions-intro">
          {{ content.permissionsIntro }}
        </p>

        <ul class="permissions-list">
          <li v-for="permission in permissions" :key="permission">
            <span aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path v-for="path in getIconPaths('check')" :key="path" :d="path" />
              </svg>
            </span>
            {{ permission }}
          </li>
        </ul>
      </section>

      <section v-if="activeSection === 'security'" class="professional-panel security-panel">
        <div class="professional-heading">
          <h2>{{ content.accountSecurity }}</h2>
        </div>

        <p v-if="securityNotice" class="security-notice">{{ securityNotice }}</p>

        <div class="security-list">
          <article v-for="item in securityItems" :key="item.title" class="security-item">
            <div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
            </div>
            <button type="button" :class="{ danger: item.danger }" @click="handleSecurityAction(item.key)">
              {{ item.action }}
            </button>
          </article>
        </div>
      </section>

      <section v-if="activeSection === 'preferences'" class="professional-panel preferences-panel">
        <div class="professional-heading">
          <h2>{{ content.preferencesTitle }}</h2>
          <button v-if="!isPreferencesEditing" type="button" @click="startPreferencesEdit">{{ content.edit }}</button>
        </div>

        <p v-if="preferencesNotice" class="security-notice">{{ preferencesNotice }}</p>

        <div v-if="!isPreferencesEditing" class="preferences-list">
          <article>
            <span>{{ content.languagePreference }}</span>
            <strong>{{ displayedPreferenceLanguage }}</strong>
          </article>
          <article>
            <span>{{ content.themePreference }}</span>
            <strong>{{ displayedTheme }}</strong>
          </article>
          <article v-for="notification in notificationPreferences" :key="notification.key">
            <span>{{ notification.label }}</span>
            <strong>{{ notification.enabled ? content.enabled : content.disabled }}</strong>
          </article>
          <article>
            <span>{{ content.dateFormat }}</span>
            <strong dir="ltr">{{ preferenceSettings.dateFormat }}</strong>
          </article>
          <article>
            <span>{{ content.numberFormat }}</span>
            <strong dir="ltr">{{ preferenceSettings.numberFormat }}</strong>
          </article>
        </div>

        <form v-else class="preferences-form" @submit.prevent="savePreferences">
          <label>
            <span>{{ content.languagePreference }}</span>
            <select v-model="preferenceForm.language">
              <option value="FR">{{ content.frenchLanguage }}</option>
              <option value="EN">{{ content.englishLanguage }}</option>
              <option value="AR">{{ content.arabicLanguage }}</option>
            </select>
          </label>

          <label>
            <span>{{ content.themePreference }}</span>
            <select v-model="preferenceForm.theme">
              <option value="Clair">{{ content.lightTheme }}</option>
              <option value="Sombre">{{ content.darkTheme }}</option>
            </select>
          </label>

          <label class="preference-check">
            <input v-model="preferenceForm.emailNotifications" type="checkbox" />
            <span>{{ content.emailNotifications }}</span>
          </label>

          <label class="preference-check">
            <input v-model="preferenceForm.securityNotifications" type="checkbox" />
            <span>{{ content.securityNotifications }}</span>
          </label>

          <label class="preference-check">
            <input v-model="preferenceForm.criticalAlerts" type="checkbox" />
            <span>{{ content.criticalAlerts }}</span>
          </label>

          <label class="preference-check">
            <input v-model="preferenceForm.periodicReports" type="checkbox" />
            <span>{{ content.periodicReports }}</span>
          </label>

          <label>
            <span>{{ content.dateFormat }}</span>
            <select v-model="preferenceForm.dateFormat">
              <option>DD/MM/YYYY</option>
              <option>MM/DD/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </label>

          <label>
            <span>{{ content.numberFormat }}</span>
            <select v-model="preferenceForm.numberFormat">
              <option>1 234,56</option>
              <option>1,234.56</option>
            </select>
          </label>

          <div class="editor-actions">
            <button type="button" class="cancel-button" @click="cancelPreferencesEdit">{{ content.cancel }}</button>
            <button type="submit" class="save-button">{{ content.save }}</button>
          </div>
        </form>
      </section>

      <section v-if="activeSection === 'activity'" class="professional-panel activity-panel">
        <div class="professional-heading">
          <h2>{{ content.recentActivity }}</h2>
          <button type="button" @click="toggleAllActivity">
            {{ showAllActivity ? content.showLess : content.showAll }}
          </button>
        </div>

        <ol class="activity-list">
          <li v-for="activity in visibleActivities" :key="activity.id">
            <time>{{ activity.date }}</time>
            <strong>{{ activity.title }}</strong>
            <span>{{ content.by }} {{ profile.name }}</span>
          </li>
        </ol>
      </section>
    </section>

    <div v-if="isEditorOpen" class="editor-backdrop" @click.self="closeEditor">
      <form class="profile-editor" @submit.prevent="saveProfile">
        <div class="editor-heading">
          <h2>{{ content.editProfile }}</h2>
          <button type="button" class="editor-close" :aria-label="content.cancel" @click="closeEditor">
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </button>
        </div>

        <label>
          <span>{{ content.name }}</span>
          <input v-model="editForm.fullName" type="text" required />
        </label>

        <label>
          <span>{{ content.email }}</span>
          <input v-model="editForm.email" type="email" required />
        </label>

        <label>
          <span>{{ content.phone }}</span>
          <input v-model="editForm.phone" type="tel" />
        </label>

        <label>
          <span>{{ content.location }}</span>
          <input v-model="editForm.location" type="text" />
        </label>

        <div class="editor-actions">
          <button type="button" class="cancel-button" @click="closeEditor">{{ content.cancel }}</button>
          <button type="submit" class="save-button">{{ content.save }}</button>
        </div>
      </form>
    </div>

    <div v-if="securityModal" class="editor-backdrop" @click.self="closeSecurityModal">
      <form v-if="securityModal === 'password'" class="profile-editor" @submit.prevent="savePassword">
        <div class="editor-heading">
          <h2>{{ content.changePassword }}</h2>
          <button type="button" class="editor-close" :aria-label="content.close" @click="closeSecurityModal">
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </button>
        </div>

        <label>
          <span>{{ content.currentPassword }}</span>
          <input v-model="passwordForm.current" type="password" required />
        </label>

        <label>
          <span>{{ content.newPassword }}</span>
          <input v-model="passwordForm.next" type="password" required minlength="8" />
        </label>

        <label>
          <span>{{ content.confirmPassword }}</span>
          <input v-model="passwordForm.confirm" type="password" required minlength="8" />
        </label>

        <p v-if="securityMessage" class="security-message">{{ securityMessage }}</p>

        <div class="editor-actions">
          <button type="button" class="cancel-button" @click="closeSecurityModal">{{ content.cancel }}</button>
          <button type="submit" class="save-button">{{ content.save }}</button>
        </div>
      </form>

      <div v-else-if="securityModal === 'sessions'" class="profile-editor">
        <div class="editor-heading">
          <h2>{{ content.activeSessions }}</h2>
          <button type="button" class="editor-close" :aria-label="content.close" @click="closeSecurityModal">
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </button>
        </div>

        <ul class="sessions-list">
          <li v-for="session in sessions" :key="session.id">
            <strong>{{ session.device }}</strong>
            <span>{{ session.meta }}</span>
          </li>
        </ul>

        <div class="editor-actions">
          <button type="button" class="save-button" @click="closeSecurityModal">{{ content.close }}</button>
        </div>
      </div>

      <div v-else-if="securityModal === 'logout'" class="profile-editor">
        <div class="editor-heading">
          <h2>{{ content.logoutTitle }}</h2>
          <button type="button" class="editor-close" :aria-label="content.close" @click="closeSecurityModal">
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </button>
        </div>

        <p class="security-confirmation">{{ content.logoutConfirmation }}</p>

        <div class="editor-actions">
          <button type="button" class="cancel-button" @click="closeSecurityModal">{{ content.cancel }}</button>
          <button type="button" class="danger-button" @click="logoutAllDevices">{{ content.logoutAction }}</button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import AdminTopControls from '@/Components/AdminTopControls.vue'
import Sidebar from '@/Components/sidebar.vue'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()
const isSidebarOpen = ref(false)
const isEditorOpen = ref(false)
const activeSection = ref('')
const securityModal = ref('')
const securityMessage = ref('')
const securityNotice = ref('')
const preferencesNotice = ref('')
const isTwoFactorEnabled = ref(false)
const isPreferencesEditing = ref(false)
const showAllActivity = ref(false)
const profileSearch = ref('')
const imageLoadFailed = ref(false)
const storedUser = ref(loadStoredUser())
const preferenceSettings = ref(loadPreferenceSettings())
const editForm = ref({
  fullName: '',
  email: '',
  phone: '',
  location: '',
})
const preferenceForm = ref({ ...preferenceSettings.value })
const passwordForm = ref({
  current: '',
  next: '',
  confirm: '',
})

const language = computed(() => languageStore.language)

const profileContent = {
  FR: {
    sidebarToggle: 'Afficher le menu',
    editProfile: 'Modifier le profil',
    name: 'Nom complet',
    email: 'E-mail',
    phone: 'Telephone',
    location: 'Localisation',
    cancel: 'Annuler',
    save: 'Enregistrer',
    close: 'Fermer',
    activeAccount: 'Compte actif',
    edit: 'Modifier',
    professionalInfo: 'Informations professionnelles',
    permissionsTitle: 'Permissions',
    permissionsIntro: 'Le Super Administrateur dispose des droits de pilotage globaux: utilisateurs, rôles, statistiques et pannes.',
    accountSecurity: 'Sécurité du compte',
    preferencesTitle: 'Préférences',
    languagePreference: 'Langue',
    themePreference: 'Thème',
    frenchLanguage: 'Français',
    englishLanguage: 'Anglais',
    arabicLanguage: 'Arabe',
    lightTheme: 'Clair',
    darkTheme: 'Sombre',
    enabled: 'Activées',
    disabled: 'Désactivées',
    dateFormat: 'Format des dates',
    numberFormat: 'Format des nombres',
    recentActivity: 'Activité récente',
    showAll: 'Voir tout',
    showLess: 'Réduire',
    by: 'par',
    emailNotifications: 'Notifications par e-mail',
    securityNotifications: 'Notifications de sécurité',
    criticalAlerts: 'Alertes critiques de maintenance',
    periodicReports: 'Rapports périodiques',
    preferencesSaved: 'Préférences enregistrées.',
    changePassword: 'Modifier le mot de passe',
    currentPassword: 'Mot de passe actuel',
    newPassword: 'Nouveau mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    activeSessions: 'Sessions actives',
    logoutTitle: 'Déconnexion',
    logoutConfirmation: 'Voulez-vous déconnecter tous les appareils ?',
    logoutAction: 'Déconnecter',
    passwordMismatch: 'Les deux mots de passe ne correspondent pas.',
    passwordUpdated: 'Mot de passe modifié avec succès.',
    allSessionsLoggedOut: 'Toutes les sessions ont été déconnectées.',
    twoFactorEnabled: "L'authentification à deux facteurs est activée.",
    twoFactorDisabled: "L'authentification à deux facteurs est désactivée.",
    profileSections: 'Sections du profil',
    sections: {
      information: 'Informations',
      permissions: 'Permissions',
      security: 'Sécurité',
      preferences: 'Préférences',
      activity: 'Activité',
    },
  },
  EN: {
    sidebarToggle: 'Show menu',
    editProfile: 'Edit profile',
    name: 'Full name',
    email: 'E-mail',
    phone: 'Phone',
    location: 'Location',
    cancel: 'Cancel',
    save: 'Save',
    close: 'Close',
    activeAccount: 'Active account',
    edit: 'Edit',
    professionalInfo: 'Professional information',
    permissionsTitle: 'Permissions',
    permissionsIntro: 'The Super Administrator has global oversight rights: users, roles, statistics, and breakdowns.',
    accountSecurity: 'Account security',
    preferencesTitle: 'Preferences',
    languagePreference: 'Language',
    themePreference: 'Theme',
    frenchLanguage: 'French',
    englishLanguage: 'English',
    arabicLanguage: 'Arabic',
    lightTheme: 'Light',
    darkTheme: 'Dark',
    enabled: 'Enabled',
    disabled: 'Disabled',
    dateFormat: 'Date format',
    numberFormat: 'Number format',
    recentActivity: 'Recent activity',
    showAll: 'View all',
    showLess: 'Show less',
    by: 'by',
    emailNotifications: 'Email notifications',
    securityNotifications: 'Security notifications',
    criticalAlerts: 'Critical maintenance alerts',
    periodicReports: 'Periodic reports',
    preferencesSaved: 'Preferences saved.',
    changePassword: 'Change password',
    currentPassword: 'Current password',
    newPassword: 'New password',
    confirmPassword: 'Confirm password',
    activeSessions: 'Active sessions',
    logoutTitle: 'Sign out',
    logoutConfirmation: 'Do you want to sign out from all devices?',
    logoutAction: 'Sign out',
    passwordMismatch: 'The two passwords do not match.',
    passwordUpdated: 'Password updated successfully.',
    allSessionsLoggedOut: 'All sessions have been signed out.',
    twoFactorEnabled: 'Two-factor authentication is enabled.',
    twoFactorDisabled: 'Two-factor authentication is disabled.',
    profileSections: 'Profile sections',
    sections: {
      information: 'Information',
      permissions: 'Permissions',
      security: 'Security',
      preferences: 'Preferences',
      activity: 'Activity',
    },
  },
  AR: {
    sidebarToggle: 'إظهار القائمة',
    editProfile: 'تعديل الملف الشخصي',
    name: 'الاسم الكامل',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    location: 'الموقع',
    cancel: 'إلغاء',
    save: 'حفظ',
    close: 'إغلاق',
    activeAccount: 'الحساب نشط',
    edit: 'تعديل',
    professionalInfo: 'المعلومات المهنية',
    permissionsTitle: 'الصلاحيات',
    permissionsIntro: 'يمتلك المدير العام صلاحيات الإشراف على المستخدمين والأدوار والإحصائيات والأعطال.',
    accountSecurity: 'أمان الحساب',
    preferencesTitle: 'التفضيلات',
    languagePreference: 'اللغة',
    themePreference: 'المظهر',
    frenchLanguage: 'الفرنسية',
    englishLanguage: 'الإنجليزية',
    arabicLanguage: 'العربية',
    lightTheme: 'فاتح',
    darkTheme: 'داكن',
    enabled: 'مفعلة',
    disabled: 'معطلة',
    dateFormat: 'تنسيق التاريخ',
    numberFormat: 'تنسيق الأرقام',
    recentActivity: 'النشاط الأخير',
    showAll: 'عرض الكل',
    showLess: 'تقليص',
    by: 'بواسطة',
    emailNotifications: 'إشعارات البريد الإلكتروني',
    securityNotifications: 'إشعارات الأمان',
    criticalAlerts: 'تنبيهات الصيانة الحرجة',
    periodicReports: 'التقارير الدورية',
    preferencesSaved: 'تم حفظ التفضيلات.',
    changePassword: 'تغيير كلمة المرور',
    currentPassword: 'كلمة المرور الحالية',
    newPassword: 'كلمة المرور الجديدة',
    confirmPassword: 'تأكيد كلمة المرور',
    activeSessions: 'الجلسات النشطة',
    logoutTitle: 'تسجيل الخروج',
    logoutConfirmation: 'هل تريد تسجيل الخروج من جميع الأجهزة؟',
    logoutAction: 'تسجيل الخروج',
    passwordMismatch: 'كلمتا المرور غير متطابقتين.',
    passwordUpdated: 'تم تحديث كلمة المرور بنجاح.',
    allSessionsLoggedOut: 'تم تسجيل الخروج من جميع الجلسات.',
    twoFactorEnabled: 'تم تفعيل المصادقة الثنائية.',
    twoFactorDisabled: 'تم تعطيل المصادقة الثنائية.',
    profileSections: 'أقسام الملف الشخصي',
    sections: {
      information: 'المعلومات',
      permissions: 'الصلاحيات',
      security: 'الأمان',
      preferences: 'التفضيلات',
      activity: 'النشاط',
    },
  },
}

const content = computed(() => ({
  ...profileContent.FR,
  ...(profileContent[language.value] || {}),
}))

const defaultUser = {
  fullName: 'Ghizlane Rabii',
  role: 'Super Administratrice',
  email: 'ghizlane@smartcalyx.ma',
  phone: '+212 6 12 34 56 78',
  location: 'Casablanca, Maroc',
  language: 'Français',
  timezone: 'GMT+1 (Europe/Casablanca)',
  profile_image: '/Profiles/ghizlane.png',
}

function loadStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}')
  } catch {
    return {}
  }
}

function loadPreferenceSettings() {
  const defaults = {
    language: localStorage.getItem('language') || 'FR',
    theme: 'Clair',
    emailNotifications: true,
    securityNotifications: true,
    criticalAlerts: true,
    periodicReports: true,
    dateFormat: 'DD/MM/YYYY',
    numberFormat: '1 234,56',
  }

  try {
    const storedPreferences = JSON.parse(localStorage.getItem('profilePreferences') || '{}')

    return {
      ...defaults,
      ...storedPreferences,
      language: normalizeLanguageCode(storedPreferences.language || defaults.language),
    }
  } catch {
    return defaults
  }
}

function normalizeLanguageCode(languageValue) {
  const value = String(languageValue || '').toLowerCase()

  if (value === 'en' || value.includes('english')) return 'EN'
  if (value === 'ar' || value.includes('arabe') || value.includes('arabic')) return 'AR'

  return 'FR'
}

function getLanguageLabel(languageCode) {
  const labelsByLanguage = {
    FR: {
      FR: 'Français',
      EN: 'Anglais',
      AR: 'Arabe',
    },
    EN: {
      FR: 'French',
      EN: 'English',
      AR: 'Arabic',
    },
    AR: {
      FR: 'الفرنسية',
      EN: 'الإنجليزية',
      AR: 'العربية',
    },
  }

  return labelsByLanguage[language.value]?.[normalizeLanguageCode(languageCode)] || labelsByLanguage.FR.FR
}

function pickText(texts) {
  return texts[language.value] || texts.FR
}

const defaultDisplayName = computed(() =>
  pickText({
    FR: 'Ghizlane Rabii',
    EN: 'Ghizlane Rabii',
    AR: 'غزلان ربيعي',
  }),
)

const profile = computed(() => {
  const user = storedUser.value

  return {
    name: formatName(user.fullName || user.full_name || defaultDisplayName.value),
    role: formatRole(user.role || 'superadmin') || defaultUser.role,
    email: user.email || defaultUser.email,
    phone: user.phone || user.phoneNumber || defaultUser.phone,
    location: formatLocation(user.location || user.city || defaultUser.location),
    language: getLanguageLabel(language.value),
    timezone: formatTimezone(user.timezone || defaultUser.timezone),
    image: imageLoadFailed.value
      ? defaultUser.profile_image
      : user.profile_image || user.profileImage || defaultUser.profile_image,
  }
})

function formatName(name) {
  const genericName = String(name || '').trim().toLowerCase()

  if (genericName === 'utilisateur' || genericName === 'user') {
    return pickText({ FR: 'Utilisateur', EN: 'User', AR: 'مستخدم' })
  }

  if (language.value !== 'AR') return name

  const knownNames = {
    'ghizlane rabii': 'غزلان ربيعي',
  }
  const nameKey = String(name || '').trim().toLowerCase()

  return knownNames[nameKey] || name
}

function formatLocation(location) {
  const knownLocations = {
    'casablanca, maroc': {
      FR: 'Casablanca, Maroc',
      EN: 'Casablanca, Morocco',
      AR: 'الدار البيضاء، المغرب',
    },
    'casablanca, morocco': {
      FR: 'Casablanca, Maroc',
      EN: 'Casablanca, Morocco',
      AR: 'الدار البيضاء، المغرب',
    },
  }
  const locationKey = String(location || '').trim().toLowerCase()

  return knownLocations[locationKey]?.[language.value] || location
}

function formatTimezone(timezone) {
  if (language.value !== 'AR') return timezone

  const knownTimezones = {
    'gmt+1 (europe/casablanca)': 'GMT+1 (توقيت المغرب)',
  }
  const timezoneKey = String(timezone || '').trim().toLowerCase()

  return knownTimezones[timezoneKey] || timezone
}

const infoItems = computed(() => [
  { key: 'email', icon: 'mail', value: profile.value.email },
  { key: 'phone', icon: 'phone', value: profile.value.phone },
  { key: 'location', icon: 'location', value: profile.value.location },
  { key: 'language', icon: 'globe', value: profile.value.language },
  { key: 'timezone', icon: 'clock', value: profile.value.timezone },
])

const sections = computed(() => [
  { key: 'information', icon: 'user', label: content.value.sections.information },
  { key: 'permissions', icon: 'shield', label: content.value.sections.permissions },
  { key: 'security', icon: 'lock', label: content.value.sections.security },
  { key: 'preferences', icon: 'settings', label: content.value.sections.preferences },
  { key: 'activity', icon: 'activity', label: content.value.sections.activity },
])

const displayedPreferenceLanguage = computed(() => {
  const labels = {
    FR: content.value.frenchLanguage,
    EN: content.value.englishLanguage,
    AR: content.value.arabicLanguage,
  }

  return labels[preferenceSettings.value.language] || labels.FR
})

const displayedTheme = computed(() => {
  return preferenceSettings.value.theme === 'Sombre' ? content.value.darkTheme : content.value.lightTheme
})

const notificationPreferences = computed(() => [
  {
    key: 'emailNotifications',
    label: content.value.emailNotifications,
    enabled: preferenceSettings.value.emailNotifications,
  },
  {
    key: 'securityNotifications',
    label: content.value.securityNotifications,
    enabled: preferenceSettings.value.securityNotifications,
  },
  {
    key: 'criticalAlerts',
    label: content.value.criticalAlerts,
    enabled: preferenceSettings.value.criticalAlerts,
  },
  {
    key: 'periodicReports',
    label: content.value.periodicReports,
    enabled: preferenceSettings.value.periodicReports,
  },
])

const professionalItems = computed(() => [
  { label: pickText({ FR: 'Fonction', EN: 'Position', AR: 'الوظيفة' }), value: profile.value.role },
  {
    label: pickText({ FR: 'Département', EN: 'Department', AR: 'القسم' }),
    value: storedUser.value.department || pickText({ FR: 'Administration générale', EN: 'General administration', AR: 'الإدارة العامة' }),
  },
  { label: pickText({ FR: 'Organisation', EN: 'Organization', AR: 'المؤسسة' }), value: storedUser.value.organization || 'SmartCalyx' },
  {
    label: pickText({ FR: 'Date de création du compte', EN: 'Account creation date', AR: 'تاريخ إنشاء الحساب' }),
    value: storedUser.value.createdAtLabel || pickText({ FR: '15 janvier 2024', EN: 'January 15, 2024', AR: '15 يناير 2024' }),
  },
  {
    label: pickText({ FR: 'Dernière connexion', EN: 'Last login', AR: 'آخر تسجيل دخول' }),
    value: storedUser.value.lastLoginLabel || pickText({ FR: '10 juillet 2026 à 09:42', EN: 'July 10, 2026 at 09:42', AR: '10 يوليو 2026 على 09:42' }),
  },
  { label: pickText({ FR: 'Identifiant administrateur', EN: 'Administrator ID', AR: 'معرّف المدير' }), value: storedUser.value.adminId || 'SUPER-ADMIN-001' },
])

const activities = computed(() => [
  {
    id: 1,
    date: pickText({ FR: '10 juillet 2026 à 09:35', EN: 'July 10, 2026 at 09:35', AR: '10 يوليو 2026 على 09:35' }),
    title: pickText({ FR: "Création d'un compte administrateur", EN: 'Administrator account created', AR: 'إنشاء حساب مدير' }),
  },
  {
    id: 2,
    date: pickText({ FR: '9 juillet 2026 à 16:21', EN: 'July 9, 2026 at 16:21', AR: '9 يوليو 2026 على 16:21' }),
    title: pickText({ FR: 'Modification des permissions', EN: 'Permissions updated', AR: 'تعديل الصلاحيات' }),
  },
  {
    id: 3,
    date: pickText({ FR: '9 juillet 2026 à 11:08', EN: 'July 9, 2026 at 11:08', AR: '9 يوليو 2026 على 11:08' }),
    title: pickText({ FR: "Ajout d'une nouvelle entreprise", EN: 'New company added', AR: 'إضافة شركة جديدة' }),
  },
  {
    id: 4,
    date: pickText({ FR: '8 juillet 2026 à 14:47', EN: 'July 8, 2026 at 14:47', AR: '8 يوليو 2026 على 14:47' }),
    title: pickText({ FR: 'Mise à jour des paramètres de sécurité', EN: 'Security settings updated', AR: 'تحديث إعدادات الأمان' }),
  },
  {
    id: 5,
    date: pickText({ FR: '8 juillet 2026 à 09:15', EN: 'July 8, 2026 at 09:15', AR: '8 يوليو 2026 على 09:15' }),
    title: pickText({ FR: 'Consultation du rapport global', EN: 'Global report viewed', AR: 'الاطلاع على التقرير العام' }),
  },
  {
    id: 6,
    date: pickText({ FR: '7 juillet 2026 à 17:03', EN: 'July 7, 2026 at 17:03', AR: '7 يوليو 2026 على 17:03' }),
    title: pickText({ FR: 'Export des statistiques globales', EN: 'Global statistics exported', AR: 'تصدير الإحصائيات العامة' }),
  },
  {
    id: 7,
    date: pickText({ FR: '7 juillet 2026 à 10:18', EN: 'July 7, 2026 at 10:18', AR: '7 يوليو 2026 على 10:18' }),
    title: pickText({ FR: 'Validation des paramètres de plateforme', EN: 'Platform settings approved', AR: 'اعتماد إعدادات المنصة' }),
  },
])

const visibleActivities = computed(() => (showAllActivity.value ? activities.value : activities.value.slice(0, 5)))

const permissions = computed(() =>
  pickText({
    FR: [
      'Gestion des utilisateurs',
      'Gestion des rôles',
      'Voir toutes les statistiques',
      'Voir toutes les pannes',
    ],
    EN: [
      'User management',
      'Role management',
      'View all statistics',
      'View all breakdowns',
    ],
    AR: [
      'إدارة المستخدمين',
      'إدارة الأدوار',
      'عرض جميع الإحصائيات',
      'عرض جميع الأعطال',
    ],
  }),
)

const securityItems = computed(() => [
  {
    key: 'password',
    title: pickText({ FR: 'Mot de passe', EN: 'Password', AR: 'كلمة المرور' }),
    description: pickText({ FR: 'Dernière modification : 10 juillet 2026', EN: 'Last updated: July 10, 2026', AR: 'آخر تعديل: 10 يوليو 2026' }),
    action: pickText({ FR: 'Modifier', EN: 'Edit', AR: 'تعديل' }),
  },
  {
    key: 'twoFactor',
    title: pickText({ FR: 'Authentification à deux facteurs', EN: 'Two-factor authentication', AR: 'المصادقة الثنائية' }),
    description: isTwoFactorEnabled.value
      ? pickText({ FR: 'Activée', EN: 'Enabled', AR: 'مفعلة' })
      : pickText({ FR: 'Désactivée', EN: 'Disabled', AR: 'معطلة' }),
    action: isTwoFactorEnabled.value
      ? pickText({ FR: 'Désactiver', EN: 'Disable', AR: 'تعطيل' })
      : pickText({ FR: 'Activer', EN: 'Enable', AR: 'تفعيل' }),
  },
  {
    key: 'sessions',
    title: pickText({ FR: 'Sessions actives', EN: 'Active sessions', AR: 'الجلسات النشطة' }),
    description: pickText({ FR: '3 sessions actives', EN: '3 active sessions', AR: '3 جلسات نشطة' }),
    action: pickText({ FR: 'Voir', EN: 'View', AR: 'عرض' }),
  },
  {
    key: 'logout',
    title: pickText({ FR: 'Déconnexion de tous les appareils', EN: 'Sign out from all devices', AR: 'تسجيل الخروج من جميع الأجهزة' }),
    description: pickText({
      FR: 'Déconnecter votre compte de toutes les sessions ouvertes.',
      EN: 'Sign out your account from every open session.',
      AR: 'تسجيل خروج حسابك من جميع الجلسات المفتوحة.',
    }),
    action: pickText({ FR: 'Déconnecter', EN: 'Sign out', AR: 'تسجيل الخروج' }),
    danger: true,
  },
])

const sessions = computed(() => [
  {
    id: 1,
    device: 'Windows - Microsoft Edge',
    meta: pickText({
      FR: 'Session actuelle • Casablanca • 16 juillet 2026',
      EN: 'Current session • Casablanca • July 16, 2026',
      AR: 'الجلسة الحالية • الدار البيضاء • 16 يوليو 2026',
    }),
  },
  {
    id: 2,
    device: 'Android - Chrome',
    meta: pickText({
      FR: 'Dernière activité : 10 juillet 2026 à 09:42',
      EN: 'Last activity: July 10, 2026 at 09:42',
      AR: 'آخر نشاط: 10 يوليو 2026 على 09:42',
    }),
  },
  {
    id: 3,
    device: 'Windows - Chrome',
    meta: pickText({
      FR: 'Dernière activité : 9 juillet 2026 à 18:10',
      EN: 'Last activity: July 9, 2026 at 18:10',
      AR: 'آخر نشاط: 9 يوليو 2026 على 18:10',
    }),
  },
])

const iconPaths = {
  mail: [
    'M4 5h16v14H4z',
    'm4 7 8 6 8-6',
  ],
  phone: [
    'M22 16.9v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.18 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.72c.12.9.32 1.77.6 2.6a2 2 0 0 1-.45 2.11L8 9.68a16 16 0 0 0 6.32 6.32l1.25-1.25a2 2 0 0 1 2.11-.45c.83.28 1.7.48 2.6.6A2 2 0 0 1 22 16.9Z',
  ],
  location: [
    'M12 21s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11Z',
    'M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  ],
  globe: [
    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z',
    'M2 12h20',
    'M12 2a15.3 15.3 0 0 1 0 20',
    'M12 2a15.3 15.3 0 0 0 0 20',
  ],
  clock: [
    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z',
    'M12 6v6l4 2',
  ],
  edit: [
    'M12 20h9',
    'M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z',
  ],
  user: [
    'M20 21a8 8 0 0 0-16 0',
    'M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  ],
  shield: [
    'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',
    'M9 12l2 2 4-5',
  ],
  lock: [
    'M6 10h12v10H6z',
    'M8 10V7a4 4 0 0 1 8 0v3',
  ],
  settings: [
    'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
    'M19 12a7 7 0 0 0-.08-1l2.03-1.58-2-3.46-2.39.96a7 7 0 0 0-1.73-1L14.5 3h-5l-.33 2.92a7 7 0 0 0-1.73 1l-2.39-.96-2 3.46L5.08 11a7 7 0 0 0 0 2l-2.03 1.58 2 3.46 2.39-.96a7 7 0 0 0 1.73 1L9.5 21h5l.33-2.92a7 7 0 0 0 1.73-1l2.39.96 2-3.46L18.92 13c.05-.33.08-.66.08-1Z',
  ],
  activity: [
    'M3 12h4l3-8 4 16 3-8h4',
  ],
  check: [
    'M20 6 9 17l-5-5',
  ],
}

function getIconPaths(icon) {
  return iconPaths[icon] || iconPaths.user
}

watch(language, (nextLanguage) => {
  preferenceSettings.value = {
    ...preferenceSettings.value,
    language: nextLanguage,
  }

  if (!isPreferencesEditing.value) {
    preferenceForm.value = {
      ...preferenceForm.value,
      language: nextLanguage,
    }
  }

  localStorage.setItem('profilePreferences', JSON.stringify(preferenceSettings.value))
  updateDocumentTitle()
})

onMounted(() => {
  updateDocumentTitle()
})

function updateDocumentTitle() {
  document.title = pickText({
    FR: 'Profil Super Admin GMAO',
    EN: 'CMMS Super Admin Profile',
    AR: 'ملف المديرة العامة للصيانة',
  })
}

function formatRole(role) {
  const roleKey = String(role || '').toLowerCase().replace(/[\s_-]+/g, '')
  const labels = {
    admin: {
      FR: 'Super Administratrice',
      EN: 'Super Administrator',
      AR: 'مديرة عامة',
    },
    superadmin: {
      FR: 'Super Administratrice',
      EN: 'Super Administrator',
      AR: 'مديرة عامة',
    },
    technicien: {
      FR: 'Technicien',
      EN: 'Technician',
      AR: 'تقني',
    },
    technician: {
      FR: 'Technicien',
      EN: 'Technician',
      AR: 'تقني',
    },
    operateur: {
      FR: 'Opérateur',
      EN: 'Operator',
      AR: 'مشغل',
    },
    operator: {
      FR: 'Opérateur',
      EN: 'Operator',
      AR: 'مشغل',
    },
  }

  return labels[roleKey]?.[language.value] || labels[roleKey]?.FR || role
}

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
  isSidebarOpen.value = false
}

function selectSection(sectionKey) {
  activeSection.value = activeSection.value === sectionKey ? '' : sectionKey
}

function useFallbackImage() {
  imageLoadFailed.value = true
}

function openEditor() {
  editForm.value = {
    fullName: profile.value.name,
    email: profile.value.email,
    phone: profile.value.phone,
    location: profile.value.location,
  }
  isEditorOpen.value = true
}

function closeEditor() {
  isEditorOpen.value = false
}

function saveProfile() {
  const nextUser = {
    ...storedUser.value,
    fullName: editForm.value.fullName.trim() || defaultUser.fullName,
    email: editForm.value.email.trim() || defaultUser.email,
    phone: editForm.value.phone.trim() || defaultUser.phone,
    location: editForm.value.location.trim() || defaultUser.location,
  }

  storedUser.value = nextUser
  localStorage.setItem('user', JSON.stringify(nextUser))
  window.dispatchEvent(new StorageEvent('storage', { key: 'user' }))
  closeEditor()
}

function handleSecurityAction(action) {
  securityMessage.value = ''

  if (action === 'password') {
    passwordForm.value = {
      current: '',
      next: '',
      confirm: '',
    }
    securityModal.value = 'password'
    return
  }

  if (action === 'twoFactor') {
    isTwoFactorEnabled.value = !isTwoFactorEnabled.value
    securityNotice.value = isTwoFactorEnabled.value
      ? content.value.twoFactorEnabled
      : content.value.twoFactorDisabled
    return
  }

  if (action === 'sessions') {
    securityModal.value = 'sessions'
    return
  }

  if (action === 'logout') {
    securityModal.value = 'logout'
  }
}

function closeSecurityModal() {
  securityModal.value = ''
  securityMessage.value = ''
}

function savePassword() {
  if (passwordForm.value.next !== passwordForm.value.confirm) {
    securityMessage.value = content.value.passwordMismatch
    return
  }

  securityNotice.value = content.value.passwordUpdated
  closeSecurityModal()
}

function logoutAllDevices() {
  localStorage.removeItem('token')
  localStorage.removeItem('rememberSmartCalyxLogin')
  securityNotice.value = content.value.allSessionsLoggedOut
  closeSecurityModal()
}

function startPreferencesEdit() {
  preferencesNotice.value = ''
  preferenceForm.value = { ...preferenceSettings.value }
  isPreferencesEditing.value = true
}

function cancelPreferencesEdit() {
  preferenceForm.value = { ...preferenceSettings.value }
  isPreferencesEditing.value = false
}

function savePreferences() {
  preferenceSettings.value = { ...preferenceForm.value }
  localStorage.setItem('profilePreferences', JSON.stringify(preferenceSettings.value))
  document.documentElement.dataset.theme = preferenceSettings.value.theme === 'Sombre' ? 'dark' : 'light'
  languageStore.setLanguage(preferenceSettings.value.language)
  preferencesNotice.value = content.value.preferencesSaved
  isPreferencesEditing.value = false
}

function toggleAllActivity() {
  showAllActivity.value = !showAllActivity.value
}

</script>

<style scoped>
.profile-layout {
  position: relative;
}

.profile-layout.theme-dark {
  background: #11180d;
  color: #eef6dc;
}

.profile-page {
  min-height: 100vh;
  width: min(100%, 960px);
  margin: 0 auto;
  padding: 72px 24px 48px;
}

.profile-top-controls {
  margin-bottom: 22px;
}

.profile-card {
  min-height: 375px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 34px;
  align-items: start;
  padding: 38px 54px 32px;
  border-radius: 28px 28px 0 0;
  background: #b8cc4c;
}

.theme-dark .profile-card {
  background: #5f7427;
}

.profile-info ul {
  display: grid;
  gap: 24px;
  margin: 0;
  padding: 0;
  list-style: none;
  color: #141c08;
  font-size: 22px;
  font-weight: 500;
}

.profile-info li {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.info-icon {
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #4b6615;
}

.info-icon svg,
.edit-icon svg,
.section-icon svg {
  width: 100%;
  height: 100%;
  display: block;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}

.edit-icon {
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
  display: inline-flex;
  color: currentColor;
}

.edit-profile {
  width: min(100%, 240px);
  min-height: 48px;
  margin-top: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  color: #a8bf42;
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.18s ease,
    transform 0.18s ease;
}

.edit-profile:hover {
  background: #ffffff;
  transform: translateY(-1px);
}

.profile-identity {
  text-align: center;
}

.photo-frame {
  width: 234px;
  aspect-ratio: 1.35;
  margin: 0 auto 8px;
  padding: 28px;
  border-radius: 26px;
  background: #ffffff;
}

.photo-frame img {
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 14px;
  object-fit: cover;
  background: #d9d9d9;
}

.profile-identity h1 {
  margin: 0 0 8px;
  color: #111706;
  font-size: 22px;
  font-weight: 500;
  letter-spacing: 0;
}

.profile-identity p {
  width: min(100%, 262px);
  min-height: 50px;
  margin: 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  color: #a8bf42;
  font-size: 22px;
  font-weight: 500;
}

.status-line {
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  gap: 18px;
  color: #0e7a12;
  font-size: 20px;
  font-weight: 500;
}

.status-line span {
  width: 17px;
  height: 17px;
  border-radius: 50%;
  background: #08760e;
}

.profile-tabs {
  min-height: 156px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-content: flex-start;
  gap: 22px 64px;
  padding: 30px 36px 24px;
  background: #eff3ed;
}

.theme-dark .profile-tabs {
  background: #182212;
}

.profile-tabs button {
  min-height: 30px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 0;
  background: transparent;
  color: #1d2118;
  font-size: 23px;
  font-weight: 500;
  cursor: pointer;
}

.theme-dark .profile-tabs button {
  color: #eef6dc;
}

.profile-tabs button:hover {
  color: #60781c;
}

.profile-tabs button.active {
  color: #4f6f12;
}

.theme-dark .profile-tabs button.active {
  color: #d7ec78;
}

.profile-tabs button.active .section-icon {
  background: #b8cc4c;
  color: #17210a;
}

.section-icon {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(184, 204, 76, 0.22);
  color: #60781c;
  padding: 6px;
}

.professional-panel {
  margin-top: 18px;
  padding: 28px 34px;
  border: 1px solid rgba(184, 204, 76, 0.28);
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.08);
}

.theme-dark .professional-panel {
  border-color: rgba(215, 236, 120, 0.24);
  background: #172112;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.26);
}

.professional-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 22px;
}

.professional-heading h2 {
  margin: 0;
  color: #17210a;
  font-size: 24px;
  font-weight: 900;
}

.theme-dark .professional-heading h2,
.theme-dark .profile-identity h1,
.theme-dark .professional-list dd,
.theme-dark .preferences-list strong,
.theme-dark .security-item h3,
.theme-dark .activity-list strong {
  color: #f6ffe8;
}

.professional-heading button {
  min-height: 40px;
  border: 0;
  border-radius: 999px;
  padding: 0 18px;
  background: #b8cc4c;
  color: #17210a;
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
}

.professional-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 28px;
  margin: 0;
}

.professional-list div {
  min-width: 0;
  padding-bottom: 14px;
  border-bottom: 1px solid #e7ecdf;
}

.theme-dark .professional-list div {
  border-bottom-color: rgba(215, 236, 120, 0.18);
}

.professional-list dt {
  color: #64748b;
  font-size: 13px;
  font-weight: 850;
}

.theme-dark .professional-list dt,
.theme-dark .permissions-intro,
.theme-dark .security-item p,
.theme-dark .preferences-list span,
.theme-dark .sessions-list span,
.theme-dark .activity-list time,
.theme-dark .activity-list span {
  color: #b8c7aa;
}

.professional-list dd {
  margin: 6px 0 0;
  color: #17210a;
  font-size: 18px;
  font-weight: 850;
}

.permissions-intro {
  max-width: 760px;
  margin: 0 0 22px;
  color: #334155;
  font-size: 17px;
  font-weight: 650;
  line-height: 1.6;
}

.permissions-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 22px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.permissions-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 10px 12px;
  border: 1px solid #e7ecdf;
  border-radius: 12px;
  background: #fbfcf8;
  color: #17210a;
  font-size: 15px;
  font-weight: 800;
}

.theme-dark .permissions-list li,
.theme-dark .security-item,
.theme-dark .preferences-list article,
.theme-dark .sessions-list li,
.theme-dark .activity-list li {
  border-color: rgba(215, 236, 120, 0.16);
  background: #111a0d;
  color: #eef6dc;
}

.permissions-list span {
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(184, 204, 76, 0.22);
  color: #4f6f12;
  padding: 5px;
}

.permissions-list svg {
  width: 100%;
  height: 100%;
  display: block;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.5;
}

.security-list {
  display: grid;
  gap: 14px;
}

.security-notice,
.security-message,
.security-confirmation {
  margin: 0 0 16px;
  border-radius: 12px;
  padding: 12px 14px;
  background: rgba(184, 204, 76, 0.18);
  color: #4f6f12;
  font-size: 14px;
  font-weight: 850;
}

.security-message {
  margin-bottom: 0;
  background: #fee2e2;
  color: #b91c1c;
}

.security-confirmation {
  color: #17210a;
}

.security-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 16px 18px;
  border: 1px solid #e7ecdf;
  border-radius: 14px;
  background: #fbfcf8;
}

.security-item h3 {
  margin: 0;
  color: #17210a;
  font-size: 17px;
  font-weight: 900;
}

.security-item p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 14px;
  font-weight: 700;
}

.security-item button {
  min-height: 38px;
  flex: 0 0 auto;
  border: 0;
  border-radius: 999px;
  padding: 0 16px;
  background: #b8cc4c;
  color: #17210a;
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
}

.security-item button.danger {
  background: #fee2e2;
  color: #b91c1c;
}

.preferences-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.preferences-list article {
  min-height: 70px;
  display: grid;
  align-content: center;
  gap: 6px;
  padding: 14px 16px;
  border: 1px solid #e7ecdf;
  border-radius: 14px;
  background: #fbfcf8;
}

.preferences-list span {
  color: #64748b;
  font-size: 13px;
  font-weight: 850;
}

.preferences-list strong {
  color: #17210a;
  font-size: 17px;
  font-weight: 900;
}

.preferences-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.preferences-form label {
  display: grid;
  gap: 7px;
  color: #475569;
  font-size: 13px;
  font-weight: 850;
}

.preferences-form select {
  height: 44px;
  width: 100%;
  border: 1px solid #dbe3d4;
  border-radius: 12px;
  padding: 0 12px;
  background: #ffffff;
  color: #17210a;
  font-size: 15px;
  font-weight: 750;
  outline: none;
}

.theme-dark .preferences-form select,
.theme-dark .profile-editor input {
  border-color: rgba(215, 236, 120, 0.2);
  background: #111a0d;
  color: #eef6dc;
}

.preferences-form select:focus {
  border-color: #a8bf42;
  box-shadow: 0 0 0 4px rgba(184, 204, 76, 0.22);
}

.preference-check {
  min-height: 44px;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid #e7ecdf;
  border-radius: 12px;
  background: #fbfcf8;
}

.theme-dark .preference-check {
  border-color: rgba(215, 236, 120, 0.16);
  background: #111a0d;
  color: #eef6dc;
}

.preference-check input {
  width: 18px;
  height: 18px;
  accent-color: #a8bf42;
}

.preferences-form .editor-actions {
  grid-column: 1 / -1;
}

.activity-list {
  display: grid;
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.activity-list li {
  position: relative;
  display: grid;
  gap: 5px;
  padding: 15px 18px 15px 48px;
  border: 1px solid #e7ecdf;
  border-radius: 14px;
  background: #fbfcf8;
}

.activity-list li::before {
  content: '';
  position: absolute;
  left: 18px;
  top: 22px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #b8cc4c;
  box-shadow: 0 0 0 5px rgba(184, 204, 76, 0.2);
}

.activity-list time {
  color: #64748b;
  font-size: 13px;
  font-weight: 850;
}

.activity-list strong {
  color: #17210a;
  font-size: 17px;
  font-weight: 900;
}

.activity-list span {
  color: #64748b;
  font-size: 14px;
  font-weight: 750;
}

.sessions-list {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.sessions-list li {
  display: grid;
  gap: 5px;
  padding: 13px 14px;
  border: 1px solid #e7ecdf;
  border-radius: 12px;
  background: #fbfcf8;
}

.sessions-list strong {
  color: #17210a;
  font-size: 15px;
  font-weight: 900;
}

.sessions-list span {
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
}

.danger-button {
  min-height: 42px;
  border: 0;
  border-radius: 12px;
  padding: 0 16px;
  background: #fee2e2;
  color: #b91c1c;
  font-size: 14px;
  font-weight: 850;
  cursor: pointer;
}

.sidebar-toggle {
  position: fixed;
  top: 24px;
  left: 24px;
  z-index: 1000;
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 16px;
  background: #ffffff;
  color: #1f2b0c;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.12);
  transition:
    opacity 0.18s ease,
    transform 0.18s ease,
    visibility 0.18s ease;
  cursor: pointer;
}

.sidebar-toggle:hover {
  border-color: rgba(79, 125, 32, 0.35);
  background: #f7fbe9;
  transform: translateY(-1px);
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

.sidebar-backdrop {
  position: fixed;
  inset: 0;
  z-index: 80;
  background: rgba(15, 23, 42, 0.28);
}

.editor-backdrop {
  position: fixed;
  inset: 0;
  z-index: 70;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.34);
}

.profile-editor {
  width: min(100%, 460px);
  display: grid;
  gap: 16px;
  padding: 22px;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.22);
}

.theme-dark .profile-editor {
  border: 1px solid rgba(215, 236, 120, 0.18);
  background: #172112;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.38);
}

.editor-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.editor-heading h2 {
  margin: 0;
  color: #17210a;
  font-size: 22px;
  font-weight: 850;
}

.theme-dark .editor-heading h2,
.theme-dark .profile-editor input {
  color: #f6ffe8;
}

.editor-close {
  position: relative;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 10px;
  background: #f8fafc;
  color: #17210a;
  cursor: pointer;
}

.theme-dark .editor-close {
  border-color: rgba(215, 236, 120, 0.18);
  background: #111a0d;
  color: #eef6dc;
}

.editor-close span {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 16px;
  height: 2px;
  border-radius: 999px;
  background: currentColor;
}

.editor-close span:first-child {
  transform: translate(-50%, -50%) rotate(45deg);
}

.editor-close span:last-child {
  transform: translate(-50%, -50%) rotate(-45deg);
}

.profile-editor label {
  display: grid;
  gap: 7px;
  color: #475569;
  font-size: 13px;
  font-weight: 800;
}

.theme-dark .profile-editor label,
.theme-dark .preferences-form label {
  color: #b8c7aa;
}

.profile-editor input {
  height: 44px;
  width: 100%;
  border: 1px solid #dbe3d4;
  border-radius: 12px;
  padding: 0 13px;
  color: #17210a;
  font-size: 15px;
  font-weight: 650;
  outline: none;
}

.profile-editor input:focus {
  border-color: #a8bf42;
  box-shadow: 0 0 0 4px rgba(184, 204, 76, 0.22);
}

.editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 6px;
}

.cancel-button,
.save-button {
  min-height: 42px;
  border: 0;
  border-radius: 12px;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 850;
  cursor: pointer;
}

.cancel-button {
  background: #eef2f7;
  color: #334155;
}

.save-button {
  background: #b8cc4c;
  color: #17210a;
}

[dir='rtl'] .sidebar-toggle {
  right: 24px;
  left: auto;
}

@media (max-width: 820px) {
  .profile-page {
    padding-inline: 16px;
    padding-top: 84px;
  }

  .sidebar-toggle {
    top: 18px;
    left: 16px;
  }

  [dir='rtl'] .sidebar-toggle {
    right: 16px;
  }

  .profile-card {
    grid-template-columns: 1fr;
    padding: 28px 22px;
  }

  .profile-identity {
    order: -1;
  }

  .profile-info ul {
    font-size: 18px;
  }

  .profile-tabs {
    gap: 18px 24px;
    padding-inline: 20px;
  }

  .profile-tabs button {
    font-size: 18px;
  }

  .professional-panel {
    padding: 22px 18px;
  }

  .professional-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .professional-list {
    grid-template-columns: 1fr;
  }

  .permissions-list {
    grid-template-columns: 1fr;
  }

  .preferences-list,
  .preferences-form {
    grid-template-columns: 1fr;
  }

  .security-item {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>

<script setup>
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppBrand from '@/Components/AppBrand.vue'
import { useLanguageStore } from '@/stores/language'
import imgAdmin from '@/assets/Admin.png'
import imgOperator from '@/assets/operateur.png'
import imgTechnician from '@/assets/Technicien.png'

const route = useRoute()
const router = useRouter()
const languageStore = useLanguageStore()
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const errorMessage = ref('')
const isLoading = ref(false)

const roleTheme = {
  operator: {
    color: '#cc1818',
    softColor: 'rgba(204, 24, 24, 0.1)',
    imageSrc: imgOperator,
  },
  admin: {
    color: '#e6b800',
    softColor: 'rgba(230, 184, 0, 0.14)',
    imageSrc: imgAdmin,
  },
  technician: {
    color: '#ff6600',
    softColor: 'rgba(255, 102, 0, 0.12)',
    imageSrc: imgTechnician,
  },
}

const loginContent = {
  FR: {
    roles: {
      operator: {
        label: 'Opérateur',
        title: 'Bonjour les opérateurs d’Agro-Food',
        imageAlt: 'Espace Opérateur SmartCalyx',
        intro:
          'Accédez rapidement à votre espace pour déclarer les pannes et suivre vos demandes d’intervention.',
      },
      admin: {
        label: 'Administration',
        title: 'Bonjour Mr Abd Elilah, connectez-vous',
        imageAlt: 'Espace Administration SmartCalyx',
        intro:
          'Pilotez les équipes, les rapports et les indicateurs de maintenance depuis un espace sécurisé.',
      },
      technician: {
        label: 'Technicien',
        title: 'Bonjour les techniciens d’Agro-Food',
        imageAlt: 'Espace Technicien SmartCalyx',
        intro:
          'Connectez-vous à votre espace SmartCalyx pour consulter vos interventions, clôturer les opérations et suivre les actions de maintenance.',
      },
    },
    email: 'Adresse e-mail',
    password: 'Mot de passe',
    remember: 'Se souvenir de moi',
    forgot: 'Mot de passe oublié ?',
    submit: 'Se connecter',
    home: 'Retour à l’accueil',
    brandAria: 'Retour à l’accueil SmartCalyx',
  },
  EN: {
    roles: {
      operator: {
        label: 'Operator',
        title: 'Hello Agro-Food operators',
        imageAlt: 'SmartCalyx operator workspace',
        intro:
          'Quickly access your workspace to report failures and track your intervention requests.',
      },
      admin: {
        label: 'Administration',
        title: 'Hello Mr Abd Elilah, please sign in',
        imageAlt: 'SmartCalyx administration workspace',
        intro:
          'Manage teams, reports, and maintenance indicators from a secure workspace.',
      },
      technician: {
        label: 'Technician',
        title: 'Hello Agro-Food technicians',
        imageAlt: 'SmartCalyx technician workspace',
        intro:
          'Sign in to your SmartCalyx workspace to view interventions, close operations, and track maintenance actions.',
      },
    },
    email: 'Email address',
    password: 'Password',
    remember: 'Remember me',
    forgot: 'Forgot password?',
    submit: 'Sign in',
    home: 'Back to home',
    brandAria: 'Back to SmartCalyx home',
  },
  AR: {
    roles: {
      operator: {
        label: 'المشغل',
        title: 'مرحبا بمشغلي Agro-Food',
        imageAlt: 'فضاء المشغل SmartCalyx',
        intro: 'ادخل بسرعة إلى فضائك للتبليغ عن الأعطال وتتبع طلبات التدخل.',
      },
      admin: {
        label: 'الإدارة',
        title: 'مرحبا السيد عبد الإله، سجل الدخول',
        imageAlt: 'فضاء الإدارة SmartCalyx',
        intro: 'قم بتدبير الفرق والتقارير ومؤشرات الصيانة من فضاء آمن.',
      },
      technician: {
        label: 'التقني',
        title: 'مرحبا بتقنيي Agro-Food',
        imageAlt: 'فضاء التقني SmartCalyx',
        intro: 'سجل الدخول إلى فضاء SmartCalyx للاطلاع على التدخلات وتتبع عمليات الصيانة.',
      },
    },
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    remember: 'تذكرني',
    forgot: 'نسيت كلمة المرور؟',
    submit: 'تسجيل الدخول',
    home: 'العودة إلى الرئيسية',
    brandAria: 'العودة إلى الصفحة الرئيسية SmartCalyx',
  },
}

const language = computed(() => languageStore.language)
const currentContent = computed(() => loginContent[language.value] || loginContent.FR)

const currentRole = computed(() => {
  const role = String(route.query.role || '').toLowerCase()
  return roleTheme[role] ? role : 'operator'
})

const currentConfig = computed(() => ({
  ...roleTheme[currentRole.value],
  ...currentContent.value.roles[currentRole.value],
}))

const pageStyles = computed(() => ({
  '--role-color': currentConfig.value.color,
  '--role-soft-color': currentConfig.value.softColor,
}))

const dashboardRouteNames = {
  super_admin: 'admin-dashboard',
  superadmin: 'admin-dashboard',
  admin: 'admin-dashboard',
  operator: 'operator-dashboard',
  technician: 'technician-dashboard',
}

function goToDashboard(role) {
  const dashboardRouteName = dashboardRouteNames[role]

  if (!dashboardRouteName) {
    errorMessage.value = 'Role utilisateur non reconnu.'
    return
  }

  localStorage.setItem('selectedRole', role)
  router.push({ name: dashboardRouteName })
}

async function handleSubmit() {
  errorMessage.value = ''

  if (!email.value.trim() || !password.value) {
    errorMessage.value = 'Veuillez saisir votre e-mail et votre mot de passe.'
    return
  }

  isLoading.value = true

  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.message || data.error || 'Connexion impossible. Veuillez reessayer.'
      return
    }

    if (!data.token || !data.user) {
      errorMessage.value = 'Reponse de connexion invalide.'
      return
    }

    const loggedUser = {
      ...data.user,
      profile_image: data.user.profile_image || data.user.profileImage || '',
    }
    const backendRole = String(loggedUser.role || currentRole.value).toLowerCase()

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(loggedUser))

    if (rememberMe.value) {
      localStorage.setItem('rememberSmartCalyxLogin', 'true')
    } else {
      localStorage.removeItem('rememberSmartCalyxLogin')
    }

    goToDashboard(backendRole)
  } catch (error) {
    errorMessage.value = 'Erreur reseau. Verifiez que le backend est demarre.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="login-page" :style="pageStyles" :dir="language === 'AR' ? 'rtl' : 'ltr'">
    <section class="login-shell">
      <div class="login-showcase">
        <RouterLink to="/" class="brand-link" :aria-label="currentContent.brandAria">
          <AppBrand />
        </RouterLink>

        <div class="showcase-image">
          <img
            :src="currentConfig.imageSrc"
            :alt="currentConfig.imageAlt"
          />
        </div>

        <div class="showcase-copy">
          <span>{{ currentConfig.label }}</span>
          <h1>SmartCalyx</h1>
          <p>{{ currentConfig.intro }}</p>
        </div>
      </div>

      <div class="login-panel">
        <div class="panel-accent" aria-hidden="true"></div>
        <div class="panel-heading">
          <span>{{ currentConfig.label }}</span>
          <h2>{{ currentConfig.title }}</h2>
        </div>

        <form class="login-form" @submit.prevent="handleSubmit">
          <label>
            <span>{{ currentContent.email }}</span>
            <input v-model="email" type="email" autocomplete="email" required />
          </label>

          <label>
            <span>{{ currentContent.password }}</span>
            <input v-model="password" type="password" autocomplete="current-password" required />
          </label>

          <div class="form-options">
            <label class="remember-option">
              <input v-model="rememberMe" type="checkbox" />
              <span>{{ currentContent.remember }}</span>
            </label>
            <a href="#">{{ currentContent.forgot }}</a>
          </div>

          <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>

          <button type="submit" :disabled="isLoading">
            {{ isLoading ? 'Connexion...' : currentContent.submit }}
          </button>
        </form>

        <RouterLink to="/" class="home-link">{{ currentContent.home }}</RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.login-page {
  align-items: center;
  background:
    linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.78)),
    url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000');
  background-position: center;
  background-size: cover;
  display: flex;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  min-height: 100vh;
  padding: 36px;
}

.login-shell {
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid color-mix(in srgb, var(--role-color) 24%, transparent);
  box-shadow: 0 24px 58px rgba(36, 48, 31, 0.14);
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(380px, 0.82fr);
  margin: 0 auto;
  max-width: 1080px;
  min-height: 680px;
  overflow: hidden;
  width: 100%;
}

.login-showcase {
  background:
    linear-gradient(135deg, var(--role-soft-color), rgba(255, 255, 255, 0.72)),
    #ffffff;
  display: flex;
  flex-direction: column;
  gap: 28px;
  justify-content: space-between;
  padding: 34px;
  position: relative;
}

.login-showcase::before,
.login-showcase::after {
  background: var(--role-color);
  border-radius: 999px;
  content: '';
  opacity: 0.12;
  position: absolute;
}

.login-showcase::before {
  height: 120px;
  right: 38px;
  top: 86px;
  width: 120px;
}

.login-showcase::after {
  bottom: 44px;
  height: 76px;
  left: 42px;
  width: 76px;
}

.brand-link {
  display: inline-flex;
  max-width: max-content;
  position: relative;
  text-decoration: none;
  z-index: 1;
}

.showcase-image {
  aspect-ratio: 16 / 10;
  background: #ffffff;
  border: 2px solid var(--role-color);
  border-radius: 24px;
  box-shadow: 0 20px 42px rgba(36, 48, 31, 0.12);
  min-height: 300px;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.showcase-image img,
.image-placeholder {
  height: 100%;
  width: 100%;
}

.showcase-image img {
  display: block;
  object-fit: cover;
}

.image-placeholder {
  align-items: center;
  background:
    linear-gradient(135deg, var(--role-soft-color), rgba(255, 255, 255, 0.9)),
    #ffffff;
  color: var(--role-color);
  display: flex;
  justify-content: center;
  padding: 28px;
  text-align: center;
}

.image-placeholder span {
  border: 1px dashed color-mix(in srgb, var(--role-color) 58%, transparent);
  border-radius: 16px;
  font-size: 15px;
  font-weight: 900;
  padding: 18px 22px;
}

.showcase-copy {
  position: relative;
  z-index: 1;
}

.showcase-copy span,
.panel-heading span {
  color: var(--role-color);
  display: block;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.1em;
  margin-bottom: 10px;
  text-transform: uppercase;
}

.showcase-copy h1 {
  color: #24301f;
  font-size: clamp(34px, 5vw, 56px);
  font-weight: 850;
  line-height: 1;
  margin: 0 0 16px;
}

.showcase-copy p {
  color: #3d4a36;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.7;
  margin: 0;
  max-width: 600px;
}

.login-panel {
  align-self: center;
  background: #ffffff;
  border-left: 1px solid color-mix(in srgb, var(--role-color) 22%, transparent);
  margin: 34px;
  padding: 44px;
  position: relative;
}

.panel-accent {
  background: var(--role-color);
  border-radius: 999px;
  height: 6px;
  margin-bottom: 28px;
  width: 78px;
}

.panel-heading h2 {
  color: #24301f;
  font-size: clamp(25px, 3vw, 34px);
  font-weight: 850;
  line-height: 1.15;
  margin: 0;
}

.login-form {
  display: grid;
  gap: 18px;
  margin-top: 34px;
}

.login-form label {
  display: grid;
  gap: 8px;
}

.login-form label > span {
  color: #24301f;
  font-size: 14px;
  font-weight: 800;
}

.login-form input[type='email'],
.login-form input[type='password'] {
  border: 1px solid color-mix(in srgb, var(--role-color) 24%, #d8ded2);
  border-radius: 14px;
  color: #24301f;
  font: inherit;
  font-weight: 600;
  outline: none;
  padding: 14px 16px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.login-form input:focus {
  border-color: var(--role-color);
  box-shadow: 0 0 0 4px var(--role-soft-color);
}

.form-options {
  align-items: center;
  display: flex;
  gap: 14px;
  justify-content: space-between;
  margin-top: 2px;
}

.remember-option {
  align-items: center;
  display: inline-flex;
  gap: 9px;
}

.remember-option input {
  accent-color: var(--role-color);
  height: 16px;
  width: 16px;
}

.remember-option span,
.form-options a,
.home-link {
  color: #4a5545;
  font-size: 14px;
  font-weight: 750;
}

.form-options a,
.home-link {
  color: var(--role-color);
  text-decoration: none;
}

.form-error {
  color: #b42318;
  font-size: 14px;
  font-weight: 750;
  margin: 0;
}

.login-form button {
  background: var(--role-color);
  border: 0;
  border-radius: 14px;
  box-shadow: 0 14px 28px color-mix(in srgb, var(--role-color) 28%, transparent);
  color: #ffffff;
  cursor: pointer;
  font: inherit;
  font-size: 15px;
  font-weight: 900;
  margin-top: 8px;
  padding: 15px 18px;
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.login-form button:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}

.login-form button:disabled {
  cursor: not-allowed;
  opacity: 0.72;
  transform: none;
}

.home-link {
  display: inline-flex;
  margin-top: 26px;
}

@media (max-width: 900px) {
  .login-page {
    padding: 18px;
  }

  .login-shell {
    grid-template-columns: 1fr;
  }

  .login-panel {
    border-left: 0;
    border-top: 1px solid color-mix(in srgb, var(--role-color) 22%, transparent);
    margin: 0;
  }
}

@media (max-width: 560px) {
  .login-showcase,
  .login-panel {
    padding: 26px 20px;
  }

  .showcase-image {
    min-height: 220px;
  }

  .form-options {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>

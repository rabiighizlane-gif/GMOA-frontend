<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  language: {
    type: String,
    default: 'FR',
  },
})

const activeCard = ref(null)
const sectionRef = ref(null)
const isVisible = ref(false)
let observer = null

const featureContent = {
  FR: {
    kicker: 'Accueil des fonctionnalites',
    heading: 'Une vue claire sur les outils essentiels de maintenance',
    features: [
      {
        title: 'Gestion equipements',
        icon: '&#9881;',
        colorClass: 'light-green',
        items: ['Suivi des equipements', 'Historique des pannes', 'Etat de disponibilite'],
      },
      {
        title: 'Gestion utilisateurs',
        icon: '&#128101;',
        colorClass: 'green',
        items: ['Roles par espace', 'Acces securise', 'Profils operateur et technicien'],
      },
      {
        title: 'Gestion interventions',
        icon: '&#128295;',
        colorClass: 'coral',
        items: ['Declaration rapide', 'Priorites des interventions', 'Suivi en temps reel'],
      },
      {
        title: 'Gestion des stocks',
        icon: '&#128230;',
        colorClass: 'brown',
        items: ['Stock disponible', 'Mouvements des pieces', 'Alertes de rupture'],
      },
      {
        title: 'KPI & Tableaux de bord',
        icon: '&#128202;',
        colorClass: 'orange',
        items: ['Indicateurs cles', 'Rapports de maintenance', 'Analyse des performances'],
      },
      {
        title: 'Notifications',
        icon: '&#128276;',
        colorClass: 'yellow',
        items: ['Alertes instantanees', 'Rappels d intervention', 'Information des equipes'],
      },
    ],
  },
  EN: {
    kicker: 'Features overview',
    heading: 'A clear view of the essential maintenance tools',
    features: [
      {
        title: 'Equipment management',
        icon: '&#9881;',
        colorClass: 'light-green',
        items: ['Equipment tracking', 'Failure history', 'Availability status'],
      },
      {
        title: 'User management',
        icon: '&#128101;',
        colorClass: 'green',
        items: ['Workspace roles', 'Secure access', 'Operator and technician profiles'],
      },
      {
        title: 'Intervention management',
        icon: '&#128295;',
        colorClass: 'coral',
        items: ['Fast reporting', 'Intervention priorities', 'Real-time tracking'],
      },
      {
        title: 'Stock management',
        icon: '&#128230;',
        colorClass: 'brown',
        items: ['Available stock', 'Spare-part movements', 'Low-stock alerts'],
      },
      {
        title: 'KPIs & Dashboards',
        icon: '&#128202;',
        colorClass: 'orange',
        items: ['Key indicators', 'Maintenance reports', 'Performance analysis'],
      },
      {
        title: 'Notifications',
        icon: '&#128276;',
        colorClass: 'yellow',
        items: ['Instant alerts', 'Intervention reminders', 'Team updates'],
      },
    ],
  },
  AR: {
    kicker: 'نظرة عامة على الوظائف',
    heading: 'رؤية واضحة لأدوات الصيانة الأساسية',
    features: [
      {
        title: 'تدبير المعدات',
        icon: '&#9881;',
        colorClass: 'light-green',
        items: ['تتبع المعدات', 'سجل الأعطال', 'حالة التوفر'],
      },
      {
        title: 'تدبير المستخدمين',
        icon: '&#128101;',
        colorClass: 'green',
        items: ['أدوار حسب الفضاء', 'ولوج آمن', 'ملفات المشغلين والتقنيين'],
      },
      {
        title: 'تدبير التدخلات',
        icon: '&#128295;',
        colorClass: 'coral',
        items: ['تصريح سريع', 'أولويات التدخل', 'تتبع فوري'],
      },
      {
        title: 'تدبير المخزون',
        icon: '&#128230;',
        colorClass: 'brown',
        items: ['المخزون المتوفر', 'حركات قطع الغيار', 'تنبيهات نفاد المخزون'],
      },
      {
        title: 'المؤشرات ولوحات القيادة',
        icon: '&#128202;',
        colorClass: 'orange',
        items: ['مؤشرات أساسية', 'تقارير الصيانة', 'تحليل الأداء'],
      },
      {
        title: 'الإشعارات',
        icon: '&#128276;',
        colorClass: 'yellow',
        items: ['تنبيهات فورية', 'تذكير بالتدخلات', 'إخبار الفرق'],
      },
    ],
  },
}

const currentContent = computed(() => featureContent[props.language] || featureContent.FR)

function toggleCard(index) {
  activeCard.value = activeCard.value === index ? null : index
}

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return
      isVisible.value = true
      observer?.disconnect()
    },
    {
      threshold: 0.22,
    },
  )

  if (sectionRef.value) {
    observer.observe(sectionRef.value)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <section
    id="fonctionnalites"
    ref="sectionRef"
    class="features-section"
    :class="{ 'is-visible': isVisible }"
  >
    <div class="features-inner" :dir="language === 'AR' ? 'rtl' : 'ltr'">
      <div class="features-heading">
        <span>{{ currentContent.kicker }}</span>
        <h2>{{ currentContent.heading }}</h2>
      </div>

      <div class="features-grid">
        <div
          v-for="(feature, index) in currentContent.features"
          :key="feature.title"
          class="card-scene"
          :class="[{ 'is-flipped': activeCard === index }, `theme-${feature.colorClass}`]"
          :style="{ '--reveal-delay': `${index * 90}ms` }"
          role="button"
          tabindex="0"
          :aria-pressed="activeCard === index"
          @click="toggleCard(index)"
          @keyup.enter="toggleCard(index)"
          @keyup.space.prevent="toggleCard(index)"
        >
          <div class="card">
            <div class="card-face card-front">
              <div class="feature-label">
                <span class="feature-icon" v-html="feature.icon"></span>
                <h2>{{ feature.title }}</h2>
              </div>
            </div>

            <div class="card-face card-back">
              <h3>{{ feature.title }}</h3>
              <ul>
                <li v-for="item in feature.items" :key="item">{{ item }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.features-section {
  --card-light-green: #c7d97a;
  --card-green: #7fab52;
  --card-coral: #e85a61;
  --card-brown: #805453;
  --card-orange: #f58b3c;
  --card-yellow: #edc93b;
  background:
    linear-gradient(rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.78)),
    url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000');
  background-position: center;
  background-size: cover;
  border-top: 1px solid rgba(127, 171, 82, 0.16);
  padding: 66px 72px 76px;
}

.features-inner {
  margin: 0 auto;
  max-width: 820px;
}

.features-heading {
  margin: 0 auto 38px;
  max-width: 720px;
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 0.55s ease,
    transform 0.55s ease;
  text-align: center;
}

.features-section.is-visible .features-heading {
  opacity: 1;
  transform: translateY(0);
}

.features-heading span {
  color: #6f9e43;
  display: block;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.09em;
  margin-bottom: 10px;
  text-transform: uppercase;
}

.features-heading h2 {
  color: #24301f;
  font-size: clamp(26px, 4vw, 38px);
  font-weight: 800;
  line-height: 1.16;
  margin: 0;
}

.features-grid {
  display: grid;
  gap: 22px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.card-scene {
  cursor: pointer;
  min-height: 220px;
  outline: none;
  opacity: 0;
  perspective: 1100px;
  transform: translateY(34px) scale(0.97);
  transition:
    opacity 0.55s ease,
    transform 0.55s ease;
  transition-delay: var(--reveal-delay);
}

.features-section.is-visible .card-scene {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.card {
  height: 100%;
  min-height: 220px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.7s ease;
  width: 100%;
}

.card-scene:hover .card,
.card-scene:focus-visible .card,
.card-scene.is-flipped .card {
  transform: rotateY(180deg);
}

.card-face {
  backface-visibility: hidden;
  border-radius: 24px;
  box-shadow: 0 18px 42px rgba(36, 48, 31, 0.1);
  display: flex;
  inset: 0;
  overflow: hidden;
  position: absolute;
}

.card-front {
  align-items: center;
  background: var(--card-color);
  justify-content: center;
  padding: 26px 20px;
}

.card-front::before {
  border: 1px solid rgba(255, 255, 255, 0.34);
  border-radius: 18px;
  content: '';
  inset: 16px;
  pointer-events: none;
  position: absolute;
}

.feature-label {
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(36, 48, 31, 0.08);
  border-radius: 4px;
  box-shadow: 0 10px 24px rgba(36, 48, 31, 0.08);
  display: flex;
  gap: 10px;
  height: 116px;
  justify-content: center;
  max-width: 160px;
  min-height: 116px;
  padding: 16px 14px;
  position: relative;
  text-align: center;
  width: 100%;
  z-index: 1;
}

.feature-icon {
  align-items: center;
  background: rgba(36, 48, 31, 0.06);
  border-radius: 999px;
  color: #24301f;
  display: flex;
  flex: 0 0 auto;
  font-size: 21px;
  height: 38px;
  justify-content: center;
  line-height: 1;
  width: 38px;
}

.feature-label h2 {
  color: #262626;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.18;
  margin: 0;
  overflow-wrap: anywhere;
}

.card-back {
  align-items: flex-start;
  background: #ffffff;
  border: 2px solid var(--card-color);
  color: #263238;
  flex-direction: column;
  justify-content: center;
  padding: 24px 22px;
  transform: rotateY(180deg);
}

.card-back h3 {
  color: #24301f;
  font-size: 19px;
  font-weight: 800;
  line-height: 1.2;
  margin: 0 0 14px;
  padding-bottom: 10px;
  position: relative;
}

.card-back h3::after {
  background: var(--card-color);
  border-radius: 999px;
  bottom: 0;
  content: '';
  height: 4px;
  left: 0;
  position: absolute;
  width: 54px;
}

.card-back ul {
  display: grid;
  gap: 10px;
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
}

.card-back li {
  color: #2f3a43;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.45;
  padding-left: 18px;
  position: relative;
}

.card-back li::before {
  background: var(--card-color);
  border-radius: 999px;
  content: '';
  height: 7px;
  left: 0;
  position: absolute;
  top: 0.52em;
  width: 7px;
}

[dir='rtl'] .card-back li {
  padding-left: 0;
  padding-right: 18px;
}

[dir='rtl'] .card-back li::before {
  left: auto;
  right: 0;
}

.theme-light-green {
  --card-color: var(--card-light-green);
}

.theme-green {
  --card-color: var(--card-green);
}

.theme-coral {
  --card-color: var(--card-coral);
}

.theme-brown {
  --card-color: var(--card-brown);
}

.theme-orange {
  --card-color: var(--card-orange);
}

.theme-yellow {
  --card-color: var(--card-yellow);
}

@media (max-width: 900px) {
  .features-section {
    padding: 52px 28px;
  }

  .features-heading {
    margin-bottom: 30px;
  }

  .features-grid {
    gap: 28px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .card-scene,
  .card {
    min-height: 210px;
  }

  .card-face {
    border-radius: 22px;
  }

  .card-front {
    padding: 28px 22px;
  }

  .feature-label {
    height: 112px;
    min-height: 112px;
    padding: 14px;
  }
}

@media (max-width: 640px) {
  .features-section {
    padding: 42px 18px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .card-front {
    padding: 28px 26px;
  }

  .feature-label h2 {
    font-size: 20px;
  }
}
</style>

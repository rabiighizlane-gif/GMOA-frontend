<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  language: {
    type: String,
    default: 'FR',
  },
})

const showImage = ref(true)
const sectionRef = ref(null)
const isVisible = ref(false)
const aboutImageSrc = '/src/assets/about-agrofood.png'
let observer = null

const aboutContent = {
  FR: {
    kicker: 'SmartCalyx',
    title: '\u00c0 propos de SmartCalyx',
    text:
      'SmartCalyx est une plateforme de Gestion de la Maintenance Assist\u00e9e par Ordinateur d\u00e9velopp\u00e9e pour accompagner Agro-Food Industrie dans la gestion efficace de la maintenance industrielle. Elle permet de centraliser les interventions, superviser les \u00e9quipements, g\u00e9rer les utilisateurs et suivre les indicateurs de performance afin d\u2019am\u00e9liorer la disponibilit\u00e9 des installations et d\u2019optimiser les op\u00e9rations de maintenance.',
    highlights: [
      'Solution interne d\u00e9di\u00e9e \u00e0 Agro-Food',
      'Suivi centralis\u00e9 de la maintenance',
      'Am\u00e9lioration de la disponibilit\u00e9 des \u00e9quipements',
    ],
    imageAlt: 'Usine Agro-Food Industrie',
    placeholder: 'Ajouter une image Agro-Food',
  },
  EN: {
    kicker: 'SmartCalyx',
    title: 'About SmartCalyx',
    text:
      'SmartCalyx is a Computerized Maintenance Management System platform developed to support Agro-Food Industrie in the efficient management of industrial maintenance. It centralizes interventions, supervises equipment, manages users, and tracks performance indicators to improve installation availability and optimize maintenance operations.',
    highlights: [
      'Internal solution dedicated to Agro-Food',
      'Centralized maintenance monitoring',
      'Improved equipment availability',
    ],
    imageAlt: 'Agro-Food Industrie plant',
    placeholder: 'Add an Agro-Food image',
  },
  AR: {
    kicker: 'SmartCalyx',
    title: 'حول SmartCalyx',
    text:
      'SmartCalyx منصة لتدبير الصيانة بمساعدة الحاسوب، تم تطويرها لمواكبة Agro-Food Industrie في التدبير الفعال للصيانة الصناعية. تتيح المنصة مركزة التدخلات، مراقبة المعدات، تدبير المستخدمين، وتتبع مؤشرات الأداء من أجل تحسين جاهزية المنشآت وتحسين عمليات الصيانة.',
    highlights: [
      'حل داخلي مخصص لـ Agro-Food',
      'تتبع مركزي للصيانة',
      'تحسين جاهزية المعدات',
    ],
    imageAlt: 'مصنع Agro-Food Industrie',
    placeholder: 'أضف صورة Agro-Food',
  },
}

const currentContent = computed(() => aboutContent[props.language] || aboutContent.FR)

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return
      isVisible.value = true
      observer?.disconnect()
    },
    {
      threshold: 0.25,
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
    id="a-propos"
    ref="sectionRef"
    class="about-section"
    :class="{ 'is-visible': isVisible }"
  >
    <div class="about-inner" :dir="language === 'AR' ? 'rtl' : 'ltr'">
      <div class="about-content">
        <span class="about-kicker">{{ currentContent.kicker }}</span>
        <h2>{{ currentContent.title }}</h2>
        <p>{{ currentContent.text }}</p>

        <div class="about-highlights">
          <div
            v-for="(highlight, index) in currentContent.highlights"
            :key="highlight"
            class="about-highlight"
            :style="{ '--item-delay': `${index * 110 + 220}ms` }"
          >
            <span aria-hidden="true"></span>
            <strong>{{ highlight }}</strong>
          </div>
        </div>
      </div>

      <div class="about-visual" aria-label="Image Agro-Food">
        <img
          v-if="showImage"
          :src="aboutImageSrc"
          :alt="currentContent.imageAlt"
          @error="showImage = false"
        />
        <div v-else class="about-placeholder">
          <span>{{ currentContent.placeholder }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about-section {
  background:
    linear-gradient(rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.78)),
    url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000');
  background-position: center;
  background-size: cover;
  border-top: 1px solid rgba(127, 171, 82, 0.16);
  padding: 70px 72px;
}

.about-inner {
  align-items: center;
  display: grid;
  gap: 44px;
  grid-template-columns: minmax(0, 1.08fr) minmax(300px, 0.92fr);
  margin: 0 auto;
  max-width: 980px;
}

.about-content {
  color: #263238;
  opacity: 0;
  transform: translateX(-26px);
  transition:
    opacity 0.65s ease,
    transform 0.65s ease;
}

.about-section.is-visible .about-content {
  opacity: 1;
  transform: translateX(0);
}

.about-kicker {
  color: #6f9e43;
  display: block;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.09em;
  margin-bottom: 10px;
  text-transform: uppercase;
}

.about-content h2 {
  color: #24301f;
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 800;
  line-height: 1.14;
  margin: 0 0 18px;
}

.about-content p {
  color: #3d4a36;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.75;
  margin: 0;
}

.about-highlights {
  display: grid;
  gap: 12px;
  margin-top: 28px;
}

.about-highlight {
  align-items: center;
  background: #ffffff;
  border: 1px solid rgba(111, 168, 50, 0.14);
  border-radius: 12px;
  box-shadow: 0 10px 26px rgba(36, 48, 31, 0.06);
  display: flex;
  gap: 12px;
  opacity: 0;
  padding: 13px 16px;
  transform: translateY(16px);
  transition:
    opacity 0.5s ease,
    transform 0.5s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
  transition-delay: var(--item-delay);
}

.about-section.is-visible .about-highlight {
  opacity: 1;
  transform: translateY(0);
}

.about-highlight:hover {
  border-color: rgba(111, 168, 50, 0.34);
  box-shadow: 0 14px 30px rgba(36, 48, 31, 0.1);
}

.about-highlight span {
  background: #6fa832;
  border-radius: 999px;
  box-shadow: 0 0 0 6px rgba(111, 168, 50, 0.12);
  flex: 0 0 auto;
  height: 9px;
  width: 9px;
}

.about-highlight strong {
  color: #24301f;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.35;
}

.about-visual {
  aspect-ratio: 4 / 3;
  background: #ffffff;
  border: 1px solid rgba(111, 168, 50, 0.16);
  border-radius: 20px;
  box-shadow: 0 18px 42px rgba(36, 48, 31, 0.1);
  min-height: 300px;
  opacity: 0;
  overflow: hidden;
  transform: translateX(26px) scale(0.98);
  transition:
    opacity 0.7s ease 0.15s,
    transform 0.7s ease 0.15s,
    box-shadow 0.25s ease;
}

.about-section.is-visible .about-visual {
  opacity: 1;
  transform: translateX(0) scale(1);
}

.about-visual:hover {
  box-shadow: 0 22px 48px rgba(36, 48, 31, 0.14);
}

.about-visual img,
.about-placeholder {
  height: 100%;
  width: 100%;
}

.about-visual img {
  display: block;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.about-visual:hover img {
  transform: scale(1.035);
}

.about-placeholder {
  align-items: center;
  background:
    linear-gradient(135deg, rgba(111, 168, 50, 0.12), rgba(237, 201, 59, 0.12)),
    #ffffff;
  color: #5b9223;
  display: flex;
  justify-content: center;
  padding: 28px;
  text-align: center;
}

.about-placeholder span {
  border: 1px dashed rgba(91, 146, 35, 0.42);
  border-radius: 14px;
  font-size: 15px;
  font-weight: 800;
  padding: 18px 22px;
}

[dir='rtl'] .about-content {
  transform: translateX(26px);
}

[dir='rtl'] .about-section.is-visible .about-content {
  transform: translateX(0);
}

[dir='rtl'] .about-visual {
  transform: translateX(-26px) scale(0.98);
}

[dir='rtl'] .about-section.is-visible .about-visual {
  transform: translateX(0) scale(1);
}

@media (max-width: 900px) {
  .about-section {
    padding: 54px 28px;
  }

  .about-inner {
    gap: 34px;
    grid-template-columns: 1fr;
  }

  .about-content,
  .about-visual,
  [dir='rtl'] .about-content,
  [dir='rtl'] .about-visual {
    transform: translateY(24px);
  }

  .about-section.is-visible .about-content,
  .about-section.is-visible .about-visual,
  [dir='rtl'] .about-section.is-visible .about-content,
  [dir='rtl'] .about-section.is-visible .about-visual {
    transform: translateY(0);
  }

  .about-visual {
    min-height: 260px;
  }
}

@media (max-width: 640px) {
  .about-section {
    padding: 44px 18px;
  }

  .about-highlight {
    align-items: flex-start;
  }

  .about-highlight span {
    margin-top: 5px;
  }
}
</style>

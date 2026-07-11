<script setup>
import Navbar from '@/Components/Navbar.vue'
import SpaceCard from '@/Components/SpaceCard.vue'
import FeaturesBar from '@/Components/FeaturesBar.vue'
import Footer from '@/Components/Footer.vue'

import imgOperateur from '@/assets/operateur.png'
import imgAdmin from '@/assets/Admin.png'
import imgTechnicien from '@/assets/Technicien.png'
</script>

<template>
  <div class="min-h-screen bg-white px-4 py-10 font-sans">
    <div class="mx-auto flex min-h-[760px] max-w-5xl flex-col overflow-hidden bg-[linear-gradient(rgba(255,255,255,0.74),rgba(255,255,255,0.74)),url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000')] bg-cover bg-center shadow-sm">
      <Navbar />

      <main class="flex flex-grow items-center justify-center px-6 py-10">
        <div class="max-w-5xl text-center">
          <h1 class="mx-auto mb-3 max-w-3xl text-3xl font-bold leading-snug text-gray-800 md:text-4xl">
            La solution intelligente pour une maintenance industrielle connectee et securisee
          </h1>
          <p class="mb-12 text-2xl font-semibold text-[#76b033]">
            Choisissez votre espace pour commencer
          </p>

          <div class="flex flex-wrap justify-center gap-8">
            <SpaceCard
              type="red"
              :imageSrc="imgOperateur"
              text="Signalez rapidement les pannes et suivez l'etat de vos demandes d'intervention."
              buttonText="Espace Operateur"
            />
            <SpaceCard
              type="yellow"
              :imageSrc="imgAdmin"
              text="Accedez au tableau de bord, consultez les rapports de maintenance et gerez les equipes."
              buttonText="Espace Administration"
            />
            <SpaceCard
              type="orange"
              :imageSrc="imgTechnicien"
              text="Recevez vos interventions, cloturez les demandes de maintenance et gerez les pieces de rechange."
              buttonText="Espace Technicien"
            />
          </div>
        </div>
      </main>

      <FeaturesBar />
      <Footer />
    </div>
  </div>
</template>

<template>
  <div class="flex flex-col items-center justify-center text-center px-6 h-full space-y-4 relative">
    <div class="relative w-12 h-12">
      <div class="absolute inset-0 rounded-full border-4 border-white/[0.05]"></div>
      <div class="absolute inset-0 rounded-full border-4 border-t-emerald-500 border-r-emerald-500 animate-spin shadow-[0_0_15px_rgba(16,185,129,0.3)]"></div>
    </div>
    <h3 class="text-sm font-bold font-outfit text-slate-200">En attente de l'extension...</h3>
    <p class="text-[10px] text-slate-400 max-w-[220px] leading-relaxed">
      Installez l'extension compagnon pour extraire gratuitement les commentaires depuis Instagram.
    </p>
    
    <!-- Download links -->
    <div class="w-full space-y-2 pt-2">
      <a 
        :href="`${config.app.baseURL}downloads/extension-chrome.zip`" 
        download="instagram-giveaway-companion-chrome.zip"
        @click="openTutorial('chrome')"
        class="w-full flex items-center justify-center gap-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 text-slate-200 text-[10px] py-2.5 px-4 rounded-xl transition font-semibold"
      >
        <Icon name="mdi:google-chrome" class="w-4 h-4 text-emerald-400" />
        Télécharger pour Chrome (.zip)
      </a>
      <a 
        :href="`${config.app.baseURL}downloads/extension-firefox.zip`" 
        download="instagram-giveaway-companion-firefox.zip"
        @click="openTutorial('firefox')"
        class="w-full flex items-center justify-center gap-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 text-slate-200 text-[10px] py-2.5 px-4 rounded-xl transition font-semibold"
      >
        <Icon name="mdi:firefox" class="w-4 h-4 text-orange-400" />
        Télécharger pour Firefox (.zip)
      </a>
    </div>
    
    <button 
      @click="$emit('load-demo')"
      class="text-slate-500 hover:text-slate-300 text-[9px] underline transition-all font-semibold pt-1"
    >
      Activer le mode Démo
    </button>

    <!-- Installation Tutorial Modal -->
    <Transition name="fade-scale">
      <div 
        v-if="showTutorialModal"
        class="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-center z-50 p-4"
      >
        <div class="w-full bg-slate-900/90 border border-white/10 rounded-3xl p-5 text-left shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col space-y-4 max-h-[90%] overflow-y-auto no-scrollbar relative">
          <!-- Browser specific header -->
          <div class="flex items-center gap-2 pb-2 border-b border-white/5">
            <Icon 
              :name="browserType === 'chrome' ? 'mdi:google-chrome' : 'mdi:firefox'" 
              class="w-5 h-5" 
              :class="browserType === 'chrome' ? 'text-emerald-400' : 'text-orange-400'"
            />
            <h4 class="text-xs font-black uppercase tracking-wider text-slate-200 font-outfit">
              Tutoriel {{ browserType === 'chrome' ? 'Chrome' : 'Firefox' }}
            </h4>
          </div>

          <!-- Steps -->
          <div class="space-y-3.5 text-slate-300 text-[10px] leading-relaxed">
            <!-- Chrome Steps -->
            <template v-if="browserType === 'chrome'">
              <div class="flex gap-2.5">
                <span class="flex-shrink-0 w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-[9px] font-bold text-emerald-400 flex items-center justify-center">1</span>
                <div>
                  <strong class="text-slate-100 font-semibold">Extraire :</strong> Décompressez l'archive <code class="bg-white/5 px-1 py-0.5 rounded font-mono text-[9px]">extension-chrome.zip</code> sur votre ordinateur.
                </div>
              </div>
              <div class="flex gap-2.5">
                <span class="flex-shrink-0 w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-[9px] font-bold text-emerald-400 flex items-center justify-center">2</span>
                <div>
                  <strong class="text-slate-100 font-semibold">Aller aux extensions :</strong> Saisissez <code class="bg-white/5 px-1 py-0.5 rounded font-mono text-[9px]">chrome://extensions</code> dans votre barre d'adresse.
                </div>
              </div>
              <div class="flex gap-2.5">
                <span class="flex-shrink-0 w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-[9px] font-bold text-emerald-400 flex items-center justify-center">3</span>
                <div>
                  <strong class="text-slate-100 font-semibold">Mode Développeur :</strong> Activez l'interrupteur en haut à droite.
                </div>
              </div>
              <div class="flex gap-2.5">
                <span class="flex-shrink-0 w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-[9px] font-bold text-emerald-400 flex items-center justify-center">4</span>
                <div>
                  <strong class="text-slate-100 font-semibold">Charger l'extension :</strong> Cliquez sur <strong class="text-emerald-400 font-bold">"Charger non empaquetée"</strong> et sélectionnez le dossier extrait.
                </div>
              </div>
            </template>

            <!-- Firefox Steps -->
            <template v-else-if="browserType === 'firefox'">
              <div class="flex gap-2.5">
                <span class="flex-shrink-0 w-4 h-4 rounded-full bg-orange-500/10 border border-orange-400/30 text-[9px] font-bold text-orange-400 flex items-center justify-center">1</span>
                <div>
                  <strong class="text-slate-100 font-semibold">Aller au débogage :</strong> Saisissez <code class="bg-white/5 px-1 py-0.5 rounded font-mono text-[9px]">about:debugging</code> dans votre barre d'adresse.
                </div>
              </div>
              <div class="flex gap-2.5">
                <span class="flex-shrink-0 w-4 h-4 rounded-full bg-orange-500/10 border border-orange-400/30 text-[9px] font-bold text-orange-400 flex items-center justify-center">2</span>
                <div>
                  <strong class="text-slate-100 font-semibold">Sélectionner Firefox :</strong> Cliquez sur <strong class="text-orange-400 font-bold">"Ce Firefox"</strong> dans le menu de gauche.
                </div>
              </div>
              <div class="flex gap-2.5">
                <span class="flex-shrink-0 w-4 h-4 rounded-full bg-orange-500/10 border border-orange-400/30 text-[9px] font-bold text-orange-400 flex items-center justify-center">3</span>
                <div>
                  <strong class="text-slate-100 font-semibold">Charger le module :</strong> Cliquez sur le bouton <strong class="text-orange-400 font-bold">"Charger un module temporaire..."</strong>.
                </div>
              </div>
              <div class="flex gap-2.5">
                <span class="flex-shrink-0 w-4 h-4 rounded-full bg-orange-500/10 border border-orange-400/30 text-[9px] font-bold text-orange-400 flex items-center justify-center">4</span>
                <div>
                  <strong class="text-slate-100 font-semibold">Sélectionner l'archive :</strong> Choisissez le fichier <code class="bg-white/5 px-1 py-0.5 rounded font-mono text-[9px]">extension-firefox.zip</code>.
                </div>
              </div>
            </template>
          </div>

          <button 
            @click="showTutorialModal = false"
            class="w-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-slate-200 font-bold py-2 rounded-xl transition text-[10px]"
          >
            Fermer et Installer
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const config = useRuntimeConfig()

defineEmits<{
  (e: 'load-demo'): void
}>()

const showTutorialModal = ref(false)
const browserType = ref<'chrome' | 'firefox'>('chrome')

function openTutorial(type: 'chrome' | 'firefox') {
  browserType.value = type
  showTutorialModal.value = true
}
</script>

<style scoped>
/* Modal Transition */
.fade-scale-enter-active, .fade-scale-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fade-scale-enter-from, .fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Hide scrollbar */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

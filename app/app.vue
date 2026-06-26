<template>
  <div class="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100 flex flex-col items-center justify-center p-4 md:p-8 font-sans overflow-y-auto relative">
    
    <!-- Ambient floating background blobs for glassmorphism refraction -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div class="absolute top-[15%] left-[20%] w-[450px] h-[450px] rounded-full bg-emerald-500/10 blur-[130px] animate-float-slow"></div>
      <div class="absolute bottom-[15%] right-[20%] w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[140px] animate-float-delay"></div>
      <div class="absolute top-[45%] right-[10%] w-[380px] h-[380px] rounded-full bg-yellow-500/5 blur-[120px] animate-float-slow" style="animation-delay: -6s;"></div>
    </div>
    
    <!-- Center Column: Smartphone Simulator (Strict 9:16 Aspect) -->
    <div class="w-full max-w-[444px] flex flex-col items-center justify-center my-auto relative z-10">
      
      <!-- Smartphone frame outline for premium mobile feel -->
      <div class="relative bg-slate-950/20 backdrop-blur-xl p-3 rounded-[54px] border-[6px] border-white/10 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.7)] w-full aspect-[9/16] overflow-hidden">
        <!-- Notch -->
        <div class="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-full z-40 border-b border-white/10 flex items-center justify-center">
          <div class="w-12 h-1 bg-white/20 rounded-full mb-1"></div>
        </div>
        
        <!-- Inner Screen Viewport -->
        <div class="w-full h-full rounded-[44px] relative overflow-hidden bg-slate-950/45 border border-white/5 flex flex-col justify-between">
          
          <!-- Instagram Safe Zone Guide (Overlay grid helper) -->
          <div 
            v-if="showSafeGuide"
            class="absolute inset-0 border-y-[2px] border-dashed border-red-500/40 pointer-events-none z-30"
            style="top: 10%; bottom: 20%;"
          >
            <div class="absolute top-2 left-2 text-[8px] font-mono text-red-500 bg-black/60 px-1 py-0.5 rounded">
              DÉBUT ZONE DE SÉCURITÉ (10%)
            </div>
            <div class="absolute bottom-2 left-2 text-[8px] font-mono text-red-500 bg-black/60 px-1 py-0.5 rounded">
              FIN ZONE DE SÉCURITÉ (80%)
            </div>
          </div>

          <!-- Instagram UI Simulator Overlay -->
          <div 
            v-if="showInstagramOverlay" 
            class="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-4"
          >
            <!-- Top Stories UI -->
            <div class="flex items-center justify-between w-full pt-6 opacity-80">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <Icon name="mdi:instagram" class="w-4 h-4 text-slate-300" />
                </div>
                <div>
                  <div class="text-[9px] font-black text-slate-200">votre_concours</div>
                  <div class="text-[7px] text-slate-400">Il y a 12h</div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <Icon name="mdi:dots-horizontal" class="w-4 h-4 text-slate-200" />
                <Icon name="mdi:close" class="w-4 h-4 text-slate-200" />
              </div>
            </div>

            <!-- Bottom Reels UI -->
            <div class="w-full pb-3 flex justify-between items-end opacity-85">
              <div class="space-y-1.5 max-w-[70%]">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full bg-slate-800"></div>
                  <span class="text-[9px] font-black">profil_createur</span>
                </div>
                <p class="text-[8px] text-slate-300 line-clamp-2 leading-relaxed">
                  Identifiez 2 amis en commentaire pour participer ! Aimez et abonnez-vous pour gagner. #concours #tirage #giveaway
                </p>
                <div class="flex items-center gap-1.5 text-[8px] text-slate-400">
                  <Icon name="mdi:music" class="w-3 h-3" />
                  Audio d'origine - Mix du Créateur
                </div>
              </div>
              <div class="flex flex-col items-center gap-3.5 pb-2">
                <div class="flex flex-col items-center">
                  <Icon name="mdi:heart" class="w-5 h-5 text-slate-200" />
                  <span class="text-[7px] mt-0.5">1,248</span>
                </div>
                <div class="flex flex-col items-center">
                  <Icon name="mdi:comment" class="w-5 h-5 text-slate-200" />
                  <span class="text-[7px] mt-0.5">342</span>
                </div>
                <Icon name="mdi:share" class="w-5 h-5 text-slate-200" />
              </div>
            </div>
          </div>

          <!-- CORE VIEWPORT / ANIMATION CONTAINER (Centered 70% Safe Zone) -->
          <div class="flex-1 w-full relative z-10 pt-[10%] pb-[20%] flex flex-col justify-center overflow-hidden">
            <Transition name="fade-slide" mode="out-in">
              <!-- State: Idle (Setup and selection screens inside the phone) -->
              <div v-if="store.status === 'idle'" key="idle" class="w-full h-full">
                
                <!-- Step 1: Loading / Waiting for Extension -->
                <CompanionLoader
                  v-if="!store.isExtensionLoaded"
                  @load-demo="giveawayService.loadDemoData()"
                />
                
                <!-- Step 2: List of Scraped Accounts (Select account first) -->
                <AccountSelection
                  v-else-if="!store.selectedAccount"
                  :accounts="store.scrapedAccounts"
                  @select="(account) => store.selectAccount(account)"
                  @delete="(username) => giveawayService.deleteAccount(username)"
                />

                <!-- Step 3: List of Scraped Posts for Selected Account -->
                <PostSelection
                  v-else-if="!store.selectedPost"
                  :selectedAccount="store.selectedAccount"
                  :posts="store.filteredPosts"
                  @select="(post) => store.selectPost(post)"
                  @delete="(url) => giveawayService.deletePost(url)"
                  @back="store.selectAccount(null)"
                />

                <!-- Step 4: Setup Conditions & Start Draw -->
                <DrawSetup
                  v-else
                  :selectedAccount="store.selectedAccount"
                  :selectedPost="store.selectedPost"
                  :checkLikes="store.checkLikes"
                  :checkFollowers="store.checkFollowers"
                  @toggle-rule="(rule) => store.toggleRule(rule)"
                  @launch="store.startDrawing()"
                  @back="store.selectPost(null)"
                />
              </div>

              <!-- States: Reveal, Purges, and Morphing Grid -->
              <UserGrid 
                v-else-if="
                  store.status === 'revealing' || 
                  store.status === 'purging_likes' || 
                  store.status === 'purging_follows' || 
                  store.status === 'morphing'
                " 
                key="grid"
              />

              <!-- States: Spinning Roulette and Victory Announcement -->
              <RouletteTape 
                v-else-if="store.status === 'spinning' || store.status === 'victory'" 
                key="tape"
              />

            </Transition>
          </div>

          <!-- Canvas Confetti locally restricted inside the phone screen boundaries -->
          <canvas ref="localConfettiCanvas" class="absolute inset-0 w-full h-full pointer-events-none z-50 rounded-[44px]"></canvas>

        </div>
      </div>
      
      <!-- Translucent Outer Controls (Safe zone helper, overlays, and Reset button outside the phone scope) -->
      <div class="mt-6 flex flex-wrap gap-2.5 justify-center text-xs relative z-20 w-full px-2">
        <button 
          @click="showInstagramOverlay = !showInstagramOverlay"
          class="px-3.5 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-[10px] font-bold text-slate-300 border border-white/5 hover:border-white/10 backdrop-blur-md transition-all flex items-center gap-1.5"
        >
          <Icon name="mdi:instagram" class="w-4 h-4 text-slate-400" />
          Overlay IG : {{ showInstagramOverlay ? 'Masquer' : 'Afficher' }}
        </button>
        
        <button 
          @click="showSafeGuide = !showSafeGuide"
          class="px-3.5 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-[10px] font-bold text-slate-300 border border-white/5 hover:border-white/10 backdrop-blur-md transition-all flex items-center gap-1.5"
        >
          <Icon name="mdi:border-all" class="w-4 h-4 text-slate-400" />
          Guides 9:16 : {{ showSafeGuide ? 'Masquer' : 'Afficher' }}
        </button>
        
        <button 
          v-if="store.status !== 'idle'"
          @click="resetDraw"
          class="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-[10px] font-bold text-red-400 border border-red-500/15 hover:border-red-500/30 backdrop-blur-md transition-all flex items-center gap-1.5"
        >
          <Icon name="mdi:refresh" class="w-4 h-4" />
          Réinitialiser le Tirage
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useGiveawayStore } from '~/stores/giveaway'
import { giveawayService } from '~/services/giveawayService'
import UserGrid from '~/components/UserGrid.vue'
import RouletteTape from '~/components/RouletteTape.vue'
import AccountSelection from '~/components/AccountSelection.vue'
import PostSelection from '~/components/PostSelection.vue'
import DrawSetup from '~/components/DrawSetup.vue'
import CompanionLoader from '~/components/CompanionLoader.vue'
import confetti from 'canvas-confetti'

const store = useGiveawayStore()

const localConfettiCanvas = ref<HTMLCanvasElement | null>(null)
let localConfetti: any = null

// UI helpers
const showInstagramOverlay = ref(false)
const showSafeGuide = ref(false)

// Reset draw and refresh extension data
function resetDraw() {
  store.reset()
  giveawayService.refreshData()
}

// Confetti triggers
function triggerLocalConfetti() {
  if (localConfettiCanvas.value && !localConfetti) {
    localConfetti = confetti.create(localConfettiCanvas.value, {
      resize: true,
      useWorker: true
    })
  }

  if (localConfetti) {
    const duration = 2.5 * 1000
    const end = Date.now() + duration
    const colors = ['#eab308', '#f59e0b', '#38bdf8', '#10b981', '#ec4899']

    const frame = () => {
      localConfetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: colors
      })
      localConfetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: colors
      })

      if (Date.now() < end && store.status === 'victory') {
        requestAnimationFrame(frame)
      }
    }
    frame()
  }
}

// Lifecycle checks
onMounted(() => {
  giveawayService.init()
})

onBeforeUnmount(() => {
  giveawayService.destroy()
})

// watch store.status to trigger confetti on victory
watch(() => store.status, (newStatus) => {
  if (newStatus === 'victory') {
    triggerLocalConfetti()
  }
})
</script>

<style>
/* Reset and background override */
html, body {
  background-color: #020617 !important;
  margin: 0;
  padding: 0;
}

/* Float animations for background blobs */
@keyframes float-slow {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
}
@keyframes float-delay {
  0%, 100% { transform: translateY(0) scale(1.05); }
  50% { transform: translateY(20px) scale(1); }
}

.animate-float-slow {
  animation: float-slow 12s ease-in-out infinite;
}
.animate-float-delay {
  animation: float-delay 15s ease-in-out infinite;
}

/* Transition for view changes */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}
</style>

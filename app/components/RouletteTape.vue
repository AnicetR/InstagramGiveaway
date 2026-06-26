<template>
  <div class="relative h-full flex flex-col items-center justify-center select-none overflow-hidden bg-slate-950">
    
    <!-- Crosshair and Tape Viewport Container -->
    <div class="w-full relative py-12 flex items-center justify-center">
      
      <!-- Top glowing crosshair pin (Wrapped in centered zero-width container to prevent scaling drift) -->
      <div 
        class="absolute left-1/2 top-8 w-0 h-0 flex flex-col items-center justify-start overflow-visible z-20 transition-all duration-300"
        :class="store.status === 'victory' ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'"
      >
        <div 
          ref="crosshairTop" 
          class="flex flex-col items-center" 
          style="transform: scale(1); transform-origin: top center;"
        >
          <div class="w-4 h-4 bg-yellow-500 rounded-full shadow-[0_0_15px_#eab308] flex-shrink-0"></div>
          <div class="w-0.5 h-6 bg-gradient-to-b from-yellow-500 to-transparent flex-shrink-0"></div>
        </div>
      </div>
      
      <!-- Bottom glowing crosshair pin -->
      <div 
        class="absolute left-1/2 bottom-8 w-0 h-0 flex flex-col items-center justify-end overflow-visible z-20 transition-all duration-300"
        :class="store.status === 'victory' ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'"
      >
        <div 
          ref="crosshairBottom" 
          class="flex flex-col items-center" 
          style="transform: scale(1); transform-origin: bottom center;"
        >
          <div class="w-0.5 h-6 bg-gradient-to-t from-yellow-500 to-transparent flex-shrink-0"></div>
          <div class="w-4 h-4 bg-yellow-500 rounded-full shadow-[0_0_15px_#eab308] flex-shrink-0"></div>
        </div>
      </div>

      <!-- Center Glowing Crosshair Line -->
      <div 
        class="absolute left-1/2 inset-y-0 w-0 flex items-center justify-center overflow-visible z-10 transition-all duration-300"
        :class="store.status === 'victory' ? 'opacity-0 scale-x-50 pointer-events-none' : 'opacity-100 scale-x-100'"
      >
        <div 
          ref="crosshairLine" 
          class="w-[2px] h-full bg-gradient-to-b from-transparent via-yellow-500 to-transparent shadow-[0_0_8px_#eab308]"
          style="transform: scaleX(1); transform-origin: center center;"
        ></div>
      </div>

      <!-- Tape Viewport (Uses flex items-center and dynamic height styles to grow in height as the tape scales) -->
      <div 
        ref="viewportWrapper"
        class="w-full overflow-hidden relative bg-slate-900/30 border-y border-slate-900/60 flex items-center"
        style="height: 148px;"
      >
        <!-- Translation Wrapper (Parent) -->
        <div 
          ref="translationWrapper"
          class="transform-gpu w-full"
          style="transform: translate3d(0px, 0, 0);"
        >
          <!-- Scale Wrapper (Child) -->
          <div 
            ref="scaleWrapper"
            :style="{ 
              paddingLeft: paddingStyle, 
              paddingRight: paddingStyle,
              transform: 'scale(1)', 
              transformOrigin: 'left center' 
            }"
            class="flex gap-4 w-max transform-gpu items-center"
          >
            <div
              v-for="(item, idx) in tapeItems"
              :key="idx"
              class="flex-shrink-0 flex flex-col items-center justify-center p-3 bg-white/[0.02] border border-white/5 rounded-2xl w-[100px] h-[100px] text-center transition-all duration-500 backdrop-blur-sm"
              :class="[
                store.status === 'victory' && idx !== winningIndex 
                  ? 'opacity-25 scale-90 border-white/5' 
                  : 'border-white/5',
                
                store.status === 'victory' && idx === winningIndex 
                  ? 'glow-gold scale-110 bg-white/[0.08] border-yellow-400/80 z-20 backdrop-blur-md' 
                  : ''
              ]"
            >
              <img 
                :src="item.avatar" 
                class="w-20 h-20 rounded-full object-cover border border-slate-700 mb-1.5 shadow-sm"
                :class="{
                  'border-yellow-400': store.status === 'victory' && idx === winningIndex
                }"
                @error="handleAvatarError($event, item.username)"
                alt="Avatar"
              />
              <div 
                class="text-[12px] font-bold truncate w-full"
                :class="store.status === 'victory' && idx === winningIndex ? 'text-yellow-400 font-extrabold' : 'text-slate-400'"
              >
                {{ item.username }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Victory HUD Announcement Card -->
    <Transition name="fade-scale">
      <div 
        v-if="store.status === 'victory' && store.winner"
        class="absolute inset-0 bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center p-6 z-30 transition-all duration-500"
      >
        <div class="w-full max-w-[360px] bg-white/[0.04] border border-white/10 rounded-[32px] p-6 text-center shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl relative">
          
          <!-- Decorative golden particle glow backings -->
          <div class="absolute -top-16 -left-16 w-32 h-32 bg-yellow-500/15 rounded-full blur-3xl"></div>
          <div class="absolute -bottom-16 -right-16 w-32 h-32 bg-yellow-500/15 rounded-full blur-3xl"></div>
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-yellow-500/10 rounded-full blur-[50px] pointer-events-none"></div>

          <!-- Winner Avatar / Trophy Badge -->
          <div class="w-40 h-40 mx-auto mb-5 relative animate-bounce">
            <img 
              :src="store.winner.avatar" 
              class="w-full h-full rounded-full object-cover border-4 border-yellow-500 shadow-[0_0_25px_rgba(245,158,11,0.55)]"
              @error="handleAvatarError($event, store.winner.username)"
              alt="Winner Avatar"
            />
            <!-- Small Trophy Badge overlay -->
            <div class="absolute -bottom-1 -right-1 w-12 h-12 bg-gradient-to-tr from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center border border-yellow-400 shadow">
              <Icon name="mdi:trophy" class="w-5 h-5 text-slate-950" />
            </div>
            <!-- Small sparkles -->
            <span class="absolute -top-0 -right-1 flex h-5 w-5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-5 w-5 bg-yellow-500"></span>
            </span>
          </div>

          <!-- Winner Label -->
          <span class="text-[10px] tracking-[0.25em] font-extrabold text-yellow-450 uppercase block mb-1">
            GAGNANT DU CONCOURS
          </span>
          
          <h2 class="text-2xl font-black bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent tracking-tight font-outfit mb-3">
            {{ store.winner.username }}
          </h2>
 
          <!-- Winning Comment Bubble -->
          <div class="bg-black/40 border border-white/10 rounded-2xl p-4 mb-6 text-left relative backdrop-blur-md shadow-inner py-6 mt-6">
            <span class="absolute -top-2 left-6 text-[8px] bg-white/[0.08] border border-white/10 px-2 py-0.5 rounded text-yellow-400 uppercase tracking-wider font-mono font-bold">
              Commentaire
            </span>
            <p class="text-s text-slate-400 italic line-clamp-3">
              "{{ store.winner.comment }}"
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useGiveawayStore, type Entrant } from '~/stores/giveaway'
import gsap from 'gsap'

const store = useGiveawayStore()

const viewportWrapper = ref<HTMLDivElement | null>(null)
const translationWrapper = ref<HTMLDivElement | null>(null)
const scaleWrapper = ref<HTMLDivElement | null>(null)
const crosshairTop = ref<HTMLDivElement | null>(null)
const crosshairBottom = ref<HTMLDivElement | null>(null)
const crosshairLine = ref<HTMLDivElement | null>(null)

const tapeItems = ref<Entrant[]>([])
const winningIndex = ref(120) // Target index in the tape

// Dynamic viewport centering offset (calculates actual center on mount)
const crosshairOffset = ref(215)

// Dimensions configuration
const TILE_WIDTH = 100 // Matches w-[100px]
const GAP = 16 // Matches gap-4
const CELL_SIZE = TILE_WIDTH + GAP // Total size of cell including offset

// ============================================================================
// CONFIGURATION DU TIRAGE ET DES ANIMATIONS (Modifiez ces valeurs pour ajuster)
// ============================================================================
const ANIMATION_CONFIG = {
  // Dépassement en fraction de carte (ex. 0.3 = 30% d'une carte)
  overshootCardFraction: 0.35,

  // Durée (en secondes) de la phase principale de rotation/décélération
  spinDuration: 10.2,

  // Courbe d'atténuation (GSAP easing) pour la phase de décélération principale
  spinEase: 'power4.inOut',

  // Durée (en secondes) de la phase de retour/rebond vers le centre
  bounceDuration: 1.3,

  // Courbe de rebond (GSAP easing) : ex. 'bounce.out', 'back.out(2)', 'elastic.out'
  bounceEase: 'bounce.out',

  // Échelle d'agrandissement finale (zoom) sur le gagnant
  targetScale: 3,

  // Courbe d'atténuation pour le zoom
  zoomEase: 'power2.inOut',

  // Délai initial (en millisecondes) avant le démarrage de la roulette après affichage
  spinDelayMs: 800
}

// Dynamic padding style to align first item exactly in the center at start
const paddingStyle = computed(() => {
  return `${crosshairOffset.value - TILE_WIDTH / 2}px`
})

function buildTape() {
  const survivors = store.users
  if (survivors.length === 0) return

  // Select a random winner from survivors
  const winner = store.selectRandomWinner()
  if (!winner) return

  const targetWinnerIndex = survivors.findIndex(u => u.id === winner.id)

  // Find a suitable index K around 120 that naturally aligns to the winner
  const S = survivors.length
  const multiple = Math.floor(120 / S)
  winningIndex.value = multiple * S + targetWinnerIndex

  const totalItemsCount = winningIndex.value + 30 // Ensure plenty of buffer elements after the winner
  const items: Entrant[] = []
  
  for (let i = 0; i < totalItemsCount; i++) {
    const survivor = survivors[i % S] 
    if (survivor) {
      items.push(survivor)
    }
  }
  
  tapeItems.value = items
}

function startSpin() {
  if (!translationWrapper.value || !scaleWrapper.value || !viewportWrapper.value) return

  // Measure actual viewport center on spin launch
  const parent = translationWrapper.value.parentElement
  if (parent) {
    crosshairOffset.value = parent.clientWidth / 2
  }

  // Use raw javascript values to prevent Vue template/reactivity updates from running on every frame
  const animState = {
    scrollProgress: 0.0,
    scaleAmount: 1.0
  }

  // Update styles directly on the DOM elements for hardware-accelerated fluid rendering
  const updateDOM = () => {
    // Center of first item is crosshairOffset.value, center of item i is crosshairOffset.value + i * CELL_SIZE
    const currentLocalX = crosshairOffset.value + animState.scrollProgress * winningIndex.value * CELL_SIZE
    const currentX = crosshairOffset.value - currentLocalX * animState.scaleAmount
    
    if (translationWrapper.value) {
      translationWrapper.value.style.transform = `translate3d(${currentX}px, 0, 0)`
    }
    if (scaleWrapper.value) {
      scaleWrapper.value.style.transform = `scale(${animState.scaleAmount})`
    }
    
    // Scale the tape viewport height so the cards are NEVER clipped on top/bottom
    if (viewportWrapper.value) {
      viewportWrapper.value.style.height = `${148 * animState.scaleAmount}px`
    }
    
    // Scale the selector crosshairs in sync to keep visual depth consistent (no drift)
    if (crosshairTop.value) {
      crosshairTop.value.style.transform = `scale(${animState.scaleAmount})`
    }
    if (crosshairBottom.value) {
      crosshairBottom.value.style.transform = `scale(${animState.scaleAmount})`
    }
    if (crosshairLine.value) {
      crosshairLine.value.style.transform = `scaleX(${animState.scaleAmount})`
    }
  }

  // Initialize
  updateDOM()

  const tl = gsap.timeline({
    onUpdate: updateDOM,
    onComplete: () => {
      // Force exact alignment on completion
      animState.scaleAmount = ANIMATION_CONFIG.targetScale
      animState.scrollProgress = 1.0
      updateDOM()
      store.setStatus('victory')
    }
  })

  // Spin Timeline (Subtle near-miss overshoot and bounce back)
  
  // Dynamically calculate overshootProgress relative to a single card's width
  const overshootProgress = 1.0 + (ANIMATION_CONFIG.overshootCardFraction / winningIndex.value)

  // 1. Scroll Position: 
  // Phase A: Spin fast and decelerate, overshooting the winner subtly (reaches overshootProgress)
  tl.to(animState, {
    scrollProgress: overshootProgress,
    duration: ANIMATION_CONFIG.spinDuration,
    ease: ANIMATION_CONFIG.spinEase
  }, 0)

  // Phase B: Correct and bounce back to exactly 1.0 (the center of the winner)
  tl.to(animState, {
    scrollProgress: 1.0,
    duration: ANIMATION_CONFIG.bounceDuration,
    ease: ANIMATION_CONFIG.bounceEase
  }, ANIMATION_CONFIG.spinDuration)

  // 2. Dynamic Zoom: Scales fluidly from 1.0x to targetScale over the entire duration
  tl.to(animState, {
    scaleAmount: ANIMATION_CONFIG.targetScale,
    duration: ANIMATION_CONFIG.spinDuration + ANIMATION_CONFIG.bounceDuration,
    ease: ANIMATION_CONFIG.zoomEase
  }, 0)
}

function resetStore() {
  store.reset()
}

onMounted(() => {
  buildTape()
  // Measure actual viewport center immediately on mount to prevent layout shifts
  if (translationWrapper.value) {
    const parent = translationWrapper.value.parentElement
    if (parent) {
      crosshairOffset.value = parent.clientWidth / 2
    }
  }
  nextTick(() => {
    setTimeout(startSpin, ANIMATION_CONFIG.spinDelayMs)
  })
})
</script>

<style scoped>
/* Victory Card Entry Scale/Fade */
.fade-scale-enter-active, .fade-scale-leave-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fade-scale-enter-from, .fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.glow-gold {
  box-shadow: 0 0 25px rgba(234, 179, 8, 0.6);
}
</style>

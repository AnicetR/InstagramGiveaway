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
                  Identifiez 2 amis en commentaire pour participer ! Aimez et abonnez-vous pour gagner. #concours #tirage #roulette
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
                <div v-if="!isExtensionLoaded" class="flex flex-col items-center justify-center text-center px-6 h-full space-y-4">
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
                      href="/downloads/extension-chrome.zip" 
                      download="roulette-compagnon-chrome.zip"
                      class="w-full flex items-center justify-center gap-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 text-slate-200 text-[10px] py-2.5 px-4 rounded-xl transition font-semibold"
                    >
                      <Icon name="mdi:google-chrome" class="w-4 h-4 text-emerald-400" />
                      Télécharger pour Chrome (.zip)
                    </a>
                    <a 
                      href="/downloads/extension-firefox.zip" 
                      download="roulette-compagnon-firefox.zip"
                      class="w-full flex items-center justify-center gap-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 text-slate-200 text-[10px] py-2.5 px-4 rounded-xl transition font-semibold"
                    >
                      <Icon name="mdi:firefox" class="w-4 h-4 text-orange-400" />
                      Télécharger pour Firefox (.zip)
                    </a>
                  </div>
                  
                  <button 
                    @click="loadDemoData"
                    class="text-slate-500 hover:text-slate-300 text-[9px] underline transition-all font-semibold pt-1"
                  >
                    Activer le mode Démo
                  </button>
                </div>
                
                <!-- Step 2: List of Scraped Posts -->
                <div v-else-if="!selectedPost" class="flex flex-col h-full px-5 py-6 justify-between select-none">
                  <div class="flex-1 flex flex-col min-h-0">
                    <div class="text-center space-y-1 mb-5 flex-shrink-0">
                      <h3 class="text-base font-bold font-outfit text-slate-100">Sélectionner un Concours</h3>
                      <p class="text-[10px] text-slate-400">Publications importées depuis l'extension</p>
                    </div>
                    
                    <!-- Posts list area -->
                    <div class="flex-1 overflow-y-auto pr-1 space-y-2.5 min-h-0">
                      <div v-if="scrapedPosts.length === 0" class="flex flex-col items-center justify-center py-16 text-center space-y-3">
                        <div class="w-10 h-10 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center text-slate-500">
                          🎰
                        </div>
                        <p class="text-[10px] text-slate-500 max-w-[180px] leading-relaxed">
                          Aucun post importé. Rendez-vous sur Instagram et cliquez sur l'extension pour extraire.
                        </p>
                      </div>
                      
                      <div 
                        v-else
                        v-for="post in scrapedPosts" 
                        :key="post.url"
                        class="bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 rounded-2xl p-3 flex items-center justify-between transition cursor-pointer"
                        @click="selectPost(post)"
                      >
                        <div class="flex-1 min-w-0 pr-2">
                          <div class="text-[11px] font-bold text-emerald-400 truncate">{{ formatPostUrl(post.url) }}</div>
                          <div class="flex gap-2 text-[9px] text-slate-400 mt-1">
                            <span>👥 {{ post.users.length }} commentaires</span>
                            <span>⏱️ {{ formatTimeAgo(post.scrapedAt) }}</span>
                          </div>
                        </div>
                        <button 
                          @click.stop="deletePost(post.url)"
                          class="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 hover:border-red-500/40 text-red-400 transition"
                        >
                          <Icon name="mdi:trash-can-outline" class="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Step 3: Setup Conditions & Start Draw -->
                <div v-else class="flex flex-col h-full px-5 py-6 justify-between select-none">
                  <div class="space-y-6">
                    <div class="text-center space-y-1">
                      <h3 class="text-base font-bold font-outfit text-slate-200">Conditions du Tirage</h3>
                      <p class="text-[10px] text-slate-400 truncate max-w-full px-4">{{ formatPostUrl(selectedPost.url) }}</p>
                    </div>
                    
                    <div class="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-3.5 text-center space-y-1">
                      <div class="text-xs font-semibold text-emerald-400">{{ selectedPost.users.length }} participants chargés</div>
                      <div class="text-[9px] text-slate-400 mt-0.5">Données prêtes pour l'élimination</div>
                      <div 
                        v-if="selectedPost.followers && selectedPost.followers.length > 0" 
                        class="text-[9px] text-emerald-400 font-bold flex items-center justify-center gap-1 mt-1"
                      >
                        <span>✓</span> {{ selectedPost.followers.length }} abonnés importés (vérification réelle)
                      </div>
                      <div 
                        v-else 
                        class="text-[9px] text-yellow-500/70 font-semibold flex items-center justify-center gap-1 mt-1"
                      >
                        <span>!</span> Abonnés non extraits (mode simulation)
                      </div>
                    </div>
                    
                    <!-- Eligibility Rules Toggles inside the simulator -->
                    <div class="space-y-3">
                      <button 
                        @click="toggleRule('likes')" 
                        class="w-full flex items-center justify-between p-3.5 rounded-2xl border text-xs font-semibold transition-all duration-300"
                        :class="checkLikes 
                          ? 'bg-rose-500/15 border-rose-500/30 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.1)] backdrop-blur-md' 
                          : 'bg-white/[0.02] border-white/5 text-slate-500'"
                      >
                        <div class="flex items-center gap-2">
                          <Icon :name="checkLikes ? 'mdi:heart' : 'mdi:heart-outline'" class="w-4 h-4" />
                          Doit aimer la publication
                        </div>
                        <span v-if="checkLikes" class="text-[9px] bg-rose-500/20 px-2 py-0.5 rounded-full font-mono font-bold">Actif</span>
                      </button>
                      
                      <button 
                        @click="toggleRule('followers')" 
                        class="w-full flex items-center justify-between p-3.5 rounded-2xl border text-xs font-semibold transition-all duration-300"
                        :class="checkFollowers 
                          ? 'bg-sky-500/15 border-sky-500/30 text-sky-300 shadow-[0_0_15px_rgba(14,165,233,0.1)] backdrop-blur-md' 
                          : 'bg-white/[0.02] border-white/5 text-slate-500'"
                      >
                        <div class="flex items-center gap-2">
                          <Icon :name="checkFollowers ? 'mdi:account-star' : 'mdi:account-outline'" class="w-4 h-4" />
                          Doit être abonné
                        </div>
                        <span v-if="checkFollowers" class="text-[9px] bg-sky-500/20 px-2 py-0.5 rounded-full font-mono font-bold">Actif</span>
                      </button>
                    </div>
                  </div>
                  
                  <div class="space-y-2">
                    <button 
                      @click="launchDraw"
                      class="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold py-3.5 px-4 rounded-2xl transition transform active:scale-[0.98] shadow-lg shadow-emerald-500/10 text-xs font-mono tracking-wider uppercase"
                    >
                      Lancer le Tirage
                    </button>
                    <button 
                      @click="selectedPost = null"
                      class="w-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 text-slate-300 font-semibold py-3 px-4 rounded-2xl transition text-xs"
                    >
                      Retour aux publications
                    </button>
                  </div>
                </div>

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
import { ref, watch, onMounted } from 'vue'
import { useGiveawayStore } from '~/stores/giveaway'
import UserGrid from '~/components/UserGrid.vue'
import RouletteTape from '~/components/RouletteTape.vue'
import confetti from 'canvas-confetti'

const store = useGiveawayStore()

const localConfettiCanvas = ref<HTMLCanvasElement | null>(null)
let localConfetti: any = null

// UI helpers
const showInstagramOverlay = ref(false)
const showSafeGuide = ref(false)

// Extension detection and list
const isExtensionLoaded = ref(false)
const scrapedPosts = ref<any[]>([])
const selectedPost = ref<any | null>(null)

// Rules Setup Toggles
const checkLikes = ref(true)
const checkFollowers = ref(true)

function toggleRule(rule: 'likes' | 'followers') {
  if (rule === 'likes') {
    checkLikes.value = !checkLikes.value
  } else if (rule === 'followers') {
    checkFollowers.value = !checkFollowers.value
  }
}

// Format utilities
function formatPostUrl(url: string) {
  if (!url) return ''
  try {
    const parts = url.split('/')
    const idx = parts.indexOf('p') !== -1 ? parts.indexOf('p') : parts.indexOf('reel')
    if (idx !== -1 && parts[idx + 1]) {
      return `instagram.com/${parts[idx]}/${parts[idx + 1]}`
    }
  } catch (e) {}
  return url.replace('https://', '').replace('www.', '').substring(0, 30) + '...'
}

function formatTimeAgo(timestamp: number) {
  if (!timestamp) return ''
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return "À l'instant"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `Il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Il y a ${hours} h`
  const date = new Date(timestamp)
  return `Le ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`
}

// Communications with the Chrome extension
function deletePost(url: string) {
  window.postMessage({ type: 'DELETE_SCRAPED_POST', data: { url } }, '*')
}

function selectPost(post: any) {
  selectedPost.value = post
}

// Reset/Abort drawing
function resetDraw() {
  store.reset()
  // Refresh posts list from extension
  window.postMessage({ type: 'GET_SCRAPED_POSTS' }, '*')
}

// Demo data generator
const MOCK_USERNAMES = [
  'pixel_nomad', 'luna_wanderlust', 'tech_pioneer', 'aurora_design', 'zen_developer',
  'golden_hour_vibes', 'indie_hacker', 'neon_dreamer', 'code_artisan', 'coffee_n_compile'
]

const MOCK_COMMENTS = [
  'Incroyable ! Je participe ! 🔥✨',
  'Je croise les doigts 🤞🎉',
  'La charte graphique est magnifique !',
  'Exactement ce dont j\'ai besoin. 🚀🙌',
  'Je taggue @nomad et @guru !'
]

function generateMockUsers(count: number) {
  const users = []
  for (let i = 0; i < count; i++) {
    const username = MOCK_USERNAMES[i % MOCK_USERNAMES.length] + (i >= MOCK_USERNAMES.length ? `_${Math.floor(i / MOCK_USERNAMES.length)}` : '')
    users.push({
      id: `mock-${i}-${Math.random().toString(36).substr(2, 9)}`,
      username: `@${username}`,
      avatar: `https://i.pravatar.cc/150?u=${username}`,
      comment: MOCK_COMMENTS[Math.floor(Math.random() * MOCK_COMMENTS.length)],
      has_liked: true,
      is_follower: true
    })
  }
  return users
}

function loadDemoData() {
  isExtensionLoaded.value = true
  scrapedPosts.value = [
    {
      url: 'https://www.instagram.com/p/mock_summer_giveaway/',
      scrapedAt: Date.now() - 1000 * 60 * 5, // 5 min ago
      users: generateMockUsers(60)
    },
    {
      url: 'https://www.instagram.com/p/mock_winter_contest/',
      scrapedAt: Date.now() - 1000 * 60 * 60 * 2, // 2h ago
      users: generateMockUsers(45)
    }
  ]
}

// Launch visual elimination/draw timeline
function launchDraw() {
  if (!selectedPost.value) return

  const users = selectedPost.value.users.map((u: any) => {
    // Vérification réelle si la liste des abonnés a été extraite par l'extension
    let is_follower = true
    if (checkFollowers.value) {
      if (selectedPost.value.followers && Array.isArray(selectedPost.value.followers)) {
        is_follower = selectedPost.value.followers.includes(u.username)
      } else {
        // Fallback simulé si la liste n'a pas été extraite
        is_follower = Math.random() > 0.40
      }
    }
    
    // likes est toujours simulé localement
    const has_liked = checkLikes.value ? (Math.random() > 0.35) : true
    
    return {
      ...u,
      has_liked,
      is_follower
    }
  })

  // Ensure there is at least one winner matching both checks
  if (users.length > 0) {
    const validUsers = users.filter((u: any) => u.has_liked && u.is_follower)
    if (validUsers.length === 0) {
      users[0].has_liked = true
      users[0].is_follower = true
    }
  }

  // Load into Pinia
  store.users = users
  store.originalUsers = [...users]
  store.url = selectedPost.value.url
  store.setStatus('revealing')
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
  // Check if we still have the old localStorage import (backup helper)
  const importedDataStr = localStorage.getItem('insta_giveaway_scraped_data')
  if (importedDataStr) {
    try {
      const payload = JSON.parse(importedDataStr)
      localStorage.removeItem('insta_giveaway_scraped_data')
      if (payload && Array.isArray(payload.users) && payload.users.length > 0) {
        selectedPost.value = {
          url: payload.url || '',
          users: payload.users,
          scrapedAt: Date.now()
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Ping Chrome extension
  let pingAttempts = 0
  const pingInterval = setInterval(() => {
    window.postMessage({ type: 'PING_EXTENSION' }, '*')
    pingAttempts++
    if (pingAttempts > 15 && !isExtensionLoaded.value) {
      clearInterval(pingInterval)
    }
  }, 250)

  // Listen to bridge messages
  window.addEventListener('message', (event) => {
    if (event.source !== window) return
    const { type, posts } = event.data
    
    if (type === 'EXTENSION_PONG') {
      isExtensionLoaded.value = true
      clearInterval(pingInterval)
      // Retrieve list of posts from extension
      window.postMessage({ type: 'GET_SCRAPED_POSTS' }, '*')
    } else if (type === 'SCRAPED_POSTS_RESPONSE') {
      scrapedPosts.value = posts || []
    }
  })
})

// watch store.status to kick off drawing timelines
watch(() => store.status, (newStatus) => {
  if (newStatus === 'revealing') {
    runTimeline()
  } else if (newStatus === 'victory') {
    triggerLocalConfetti()
  }
})

function runTimeline() {
  const staggerDuration = store.users.length * 35
  const revealDelay = Math.max(2000, staggerDuration + 1200)

  setTimeout(() => {
    if (store.status !== 'revealing') return
    
    if (checkLikes.value) {
      store.setStatus('purging_likes')
      setTimeout(() => {
        if (store.status !== 'purging_likes') return
        store.purgeNonLikers()
        setTimeout(checkNextPhaseAfterLikes, 1800)
      }, 1500)
    } else {
      checkNextPhaseAfterLikes()
    }
  }, revealDelay)
}

function checkNextPhaseAfterLikes() {
  if (checkFollowers.value) {
    store.setStatus('purging_follows')
    setTimeout(() => {
      if (store.status !== 'purging_follows') return
      store.purgeNonFollowers()
      setTimeout(transitionToMorph, 1800)
    }, 1500)
  } else {
    transitionToMorph()
  }
}

function transitionToMorph() {
  store.setStatus('morphing')
  setTimeout(() => {
    if (store.status !== 'morphing') return
    store.setStatus('spinning')
  }, 2500)
}
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

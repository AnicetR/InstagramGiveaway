<template>
  <div 
    class="relative h-full flex flex-col p-4 justify-between"
    :class="store.status === 'morphing' ? 'opacity-0 scale-90 blur-md pointer-events-none transition-all duration-700 ease-in-out' : 'opacity-100 scale-100 blur-none transition-all duration-500'"
  >
    <!-- Header Summary -->
    <div class="mb-3 flex items-center justify-between border-b border-slate-900 pb-3 transition-opacity duration-500">
      <div>
        <h2 class="text-sm font-semibold text-slate-400">
          {{ phaseTitle }}
        </h2>
        <p class="text-[10px] text-slate-500 mt-0.5">
          {{ phaseSubtitle }}
        </p>
      </div>
      <div class="px-2.5 py-1 bg-slate-900/60 border border-slate-800 rounded-full text-[10px] font-bold text-slate-300">
        {{ displayedUsers.length }} Participants
      </div>
    </div>

    <!-- The Grid Container -->
    <div 
      ref="scrollContainer"
      class="flex-1 no-scrollbar flex items-center justify-center w-full overflow-hidden"
    >
      <TransitionGroup 
        name="list" 
        tag="div" 
        class="grid w-full h-max justify-items-stretch content-center p-1"
        :style="{ 
          gridTemplateColumns: gridStyles.gridTemplateColumns, 
          gap: gridGapStyle,
          '--card-size': `${cardSize}px`
        }"
      >
        <div
          v-for="user in displayedUsers"
          :key="user.id"
          :data-card-id="user.id"
          class="card-transition shadow-md overflow-hidden flex flex-col items-center justify-center text-center backdrop-blur-md"
          :class="getUserCardClass(user)"
        >
          <!-- Elimination Indicator Badges -->
          <div 
            v-if="isEliminatedFromLikes(user)"
            class="absolute top-0.5 right-0.5 bg-red-500/90 text-white rounded-full p-0.5 animate-pulse z-10 scale-75"
          >
            <Icon name="mdi:heart-off" class="w-3.5 h-3.5" />
          </div>
          <div 
            v-if="isEliminatedFromFollows(user)" 
            class="absolute top-0.5 right-0.5 bg-red-500/90 text-white rounded-full p-0.5 animate-pulse z-10 scale-75"
          >
            <Icon name="mdi:account-remove" class="w-3.5 h-3.5" />
          </div>

          <!-- Entrant Avatar -->
          <div class="card-avatar-wrapper relative flex-shrink-0 transition-all duration-700 ease-in-out">
            <img 
              :src="user.avatar" 
              class="w-full h-full object-cover border border-slate-700 shadow-sm rounded-full"
              :class="{
                'border-emerald-400': isApproved(user)
              }"
              @error="handleAvatarError($event, user.username)"
              alt="Avatar"
            />
            <!-- Status mini indicator dots (only on larger grids) -->
            <div 
              v-if="lockedCols <= 3" 
              class="absolute -bottom-0.5 -right-0.5 flex gap-0.5"
            >
              <span 
                class="w-2 h-2 rounded-full border border-slate-950"
                :class="user.has_liked ? 'bg-rose-500' : 'bg-slate-700'"
              ></span>
              <span 
                class="w-2 h-2 rounded-full border border-slate-950"
                :class="user.is_follower ? 'bg-sky-500' : 'bg-slate-700'"
              ></span>
            </div>
          </div>

          <!-- Text Details -->
          <div class="min-w-0 text-center w-full transition-all duration-700 ease-in-out">
            <div class="card-username font-bold text-slate-100 truncate tracking-tight w-full transition-all duration-700">
              {{ user.username }}
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- Popover when all participants are subscribers -->
    <Transition name="fade-scale">
      <div 
        v-if="showFollowersPopover"
        class="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm z-30 pointer-events-none p-4"
      >
        <div class="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/40 backdrop-blur-md rounded-2xl py-4 px-6 shadow-[0_8px_32px_rgba(16,185,129,0.3)] flex flex-col items-center gap-2 max-w-[280px] text-center animate-bounce-short">
          <div class="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            <Icon name="mdi:check-decagram" class="w-6 h-6 animate-pulse" />
          </div>
          <div class="text-xs font-black text-emerald-400 uppercase tracking-wider font-outfit">
            Abonnements vérifiés
          </div>
          <p class="text-[10px] text-slate-200 font-medium leading-relaxed">
            Tous les participants sont abonnés !
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useGiveawayStore, type Entrant } from '~/stores/giveaway'

const store = useGiveawayStore()
const status = computed(() => store.status)

// Local array to handle staggered loading entry animation
const displayedUsers = ref<Entrant[]>([])
const showFollowersPopover = ref(false)
const checkedUserIds = ref<Record<string, 'follower' | 'non-follower'>>({})

// Titles depending on the state
const phaseTitle = computed(() => {
  switch (status.value) {
    case 'revealing': return 'COMMENTAIRES ELIGIBLES'
    case 'purging_likes': return 'FILTRE DES J\'AIME'
    case 'purging_follows': return 'VÉRIFICATION DES FOLLOWS'
    default: return 'PARTICIPANTS AU CONCOURS'
  }
})

const phaseSubtitle = computed(() => {
  switch (status.value) {
    case 'revealing': return 'Mise en place de la grille...'
    case 'purging_likes': return 'Élimination des utilisateurs qui n\'ont pas AIMÉ la publication...'
    case 'purging_follows': return 'Élimination des utilisateurs qui ne sont pas ABONNÉS...'
    default: return ''
  }
})

const lockedCols = ref(3)

function updateLockedCols(count: number) {
  let cols = 3
  if (count <= 4) cols = 2
  else if (count <= 12) cols = 3
  else if (count <= 24) cols = 4
  else if (count <= 40) cols = 5
  else if (count <= 60) cols = 6
  else if (count <= 84) cols = 7
  else cols = 8
  
  lockedCols.value = cols
}

// Dynamic grid columns configuration based on size
const gridStyles = computed(() => {
  return {
    gridTemplateColumns: `repeat(${lockedCols.value}, minmax(0, 1fr))`,
    cols: lockedCols.value
  }
})

// Dynamic grid gap style based on columns
const gridGapStyle = computed(() => {
  const cols = gridStyles.value.cols
  if (cols <= 3) return '8px'
  if (cols <= 5) return '6px'
  return '4px'
})

const cardSize = computed(() => {
  const cols = lockedCols.value
  const containerWidth = 360 // Width of container in simulator
  const gap = cols <= 3 ? 8 : cols <= 5 ? 6 : 4
  const padding = 16
  return Math.floor((containerWidth - gap * (cols - 1) - padding * 2) / cols)
})

// Helper predicates for user elimination/approval states
const isEliminatedFromLikes = (user: Entrant) => status.value === 'purging_likes' && !user.has_liked
const isEliminatedFromFollows = (user: Entrant) => status.value === 'purging_follows' && checkedUserIds.value[user.id] === 'non-follower'
const isApproved = (user: Entrant) => {
  if (status.value === 'purging_likes') return user.has_liked
  if (status.value === 'purging_follows') return checkedUserIds.value[user.id] === 'follower'
  return false
}

// Computes dynamic styles and border configurations for each user card
function getUserCardClass(user: Entrant) {
  const classes: string[] = []

  if (status.value === 'purging_likes') {
    if (user.has_liked) {
      classes.push('border border-emerald-500/40 bg-emerald-950/20')
    } else {
      classes.push('border border-red-900/40 bg-red-950/10 grayscale opacity-25 scale-95')
    }
  } else if (status.value === 'purging_follows') {
    const followState = checkedUserIds.value[user.id]
    if (followState === 'follower') {
      classes.push('border border-emerald-500/70 shadow-[0_0_12px_rgba(16,185,129,0.15)] bg-emerald-950/70')
    } else if (followState === 'non-follower') {
      classes.push('border border-red-900/40 bg-red-950/10 grayscale opacity-25 scale-95')
    } else {
      classes.push('border border-white/5 bg-white/[0.03]')
    }
  } else {
    classes.push('border border-white/5 bg-white/[0.03]')
  }

  return classes.join(' ')
}

// Trigger staggered display of store users
function staggerReveal() {
  displayedUsers.value = []
  const rawUsers = [...store.users]
  updateLockedCols(0)
  let idx = 0
  
  function addNext() {
    if (idx < rawUsers.length && status.value === 'revealing') {
      const user = rawUsers[idx]
      if (user) {
        displayedUsers.value.push(user)
        updateLockedCols(displayedUsers.value.length)
      }
      idx++
      
      // Auto grid rearrangement animates automatically via CSS and columns computed
      setTimeout(addNext, 35)
    }
  }
  
  addNext()
}

// Verification process for user subscription verification (purging_follows)
function startFollowersVerification() {
  checkedUserIds.value = {}
  const rawUsers = [...displayedUsers.value]
  if (rawUsers.length === 0) return

  const phaseDuration = Math.max(1500, 2500 / rawUsers.length)
  const checkInterval = (phaseDuration - 300) / rawUsers.length
  let idx = 0
  
  function checkNext() {
    if (status.value !== 'purging_follows') return

    if (idx < rawUsers.length) {
      const user = rawUsers[idx]
      if (user) {
        // Re-assign object to trigger ref reactivity explicitly
        checkedUserIds.value = { 
          ...checkedUserIds.value, 
          [user.id]: user.is_follower ? 'follower' : 'non-follower' 
        }
        idx++
        setTimeout(checkNext, checkInterval)
      }
    } else {
      const allFollowers = rawUsers.every(u => u.is_follower)
      if (allFollowers) {
        showFollowersPopover.value = true
        setTimeout(() => {
          showFollowersPopover.value = false
        }, 1800)
      }
    }
  }
  
  checkNext()
}

onMounted(() => {
  if (status.value === 'revealing') {
    updateLockedCols(0)
    staggerReveal()
  } else {
    displayedUsers.value = [...store.users]
    updateLockedCols(displayedUsers.value.length)
  }
})

// Sync local users list with store when purges remove items
watch(() => store.users, (newUsers) => {
  // We only replace directly if we are not currently staggering the reveal
  if (status.value !== 'revealing') {
    displayedUsers.value = [...newUsers]
    updateLockedCols(newUsers.length)
  } else {
    updateLockedCols(displayedUsers.value.length)
  }
}, { deep: true })

watch(status, async (newStatus) => {
  if (newStatus === 'revealing') {
    updateLockedCols(0)
    staggerReveal()
  }

  if (newStatus === 'purging_follows') {
    startFollowersVerification()
  } else {
    showFollowersPopover.value = false
    checkedUserIds.value = {}
  }
})
</script>

<style scoped>
/* Card layout/dimensions transition rules */
.card-transition {
  position: relative;
  width: var(--card-size);
  height: var(--card-size);
  padding: calc(var(--card-size) * 0.08);
  border-radius: calc(var(--card-size) * 0.16);
  transition: all 0.7s cubic-bezier(0.25, 1, 0.5, 1);
}

.card-avatar-wrapper {
  width: calc(var(--card-size) * 0.52);
  height: calc(var(--card-size) * 0.52);
  margin-bottom: calc(var(--card-size) * 0.05);
}

.card-username {
  font-size: calc(var(--card-size) * 0.11);
}

/* Vue Transition Group Animation styling */
.list-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.list-enter-from {
  opacity: 0;
  transform: translateY(15px) scale(0.85);
}

/* Leave animation rules (collapses height/margin/scale) */
.list-leave-active {
  transition: all 0.8s cubic-bezier(0.36, 0, 0.66, -0.56);
  position: absolute;
  z-index: 0;
  pointer-events: none;
}
.list-leave-to {
  opacity: 0;
  transform: scale(0.4) translateY(-15px);
  filter: grayscale(100%);
}

/* Move transitions for smooth grid reflow and scaling up/down */
.list-move {
  transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
}

/* Popover transition */
.fade-scale-enter-active, .fade-scale-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fade-scale-enter-from, .fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}

@keyframes bounce-short {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
.animate-bounce-short {
  animation: bounce-short 2s ease-in-out infinite;
}
</style>

<template>
  <div 
    class="relative h-full transition-all duration-1000 ease-in-out flex flex-col justify-between"
    :class="{ 
      'p-4': status !== 'morphing',
      'justify-center items-center py-0 px-0': status === 'morphing'
    }"
  >
    <!-- Header Summary (only visible during reveal and purging) -->
    <div 
      v-if="status !== 'morphing'"
      class="mb-3 flex items-center justify-between border-b border-slate-900 pb-3 transition-opacity duration-500"
    >
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
      class="flex-1 transition-all duration-1000 ease-in-out no-scrollbar flex items-center justify-center w-full overflow-hidden"
      :class="{
        'flex flex-row overflow-x-hidden w-full items-center justify-start gap-4 py-6 h-[148px] bg-slate-900/30 border-y border-slate-900/60 backdrop-blur-sm relative': status === 'morphing'
      }"
    >
      <TransitionGroup 
        name="list" 
        tag="div" 
        :class="[
          status !== 'morphing' 
            ? 'grid w-full h-max justify-items-stretch content-center p-1' 
            : 'flex flex-row items-center gap-4 w-max'
        ]"
        :style="status !== 'morphing' ? { 
          gridTemplateColumns: gridStyles.gridTemplateColumns, 
          gap: gridGapStyle 
        } : {
          paddingLeft: 'calc(50% - 50px)',
          paddingRight: 'calc(50% - 50px)'
        }"
      >
        <div
          v-for="user in displayedUsers"
          :key="user.id"
          class="card-transition shadow-md relative overflow-hidden flex backdrop-blur-md"
          :class="[
            // Dynamic classes computed by cardStyles
            status !== 'morphing' ? cardStyles.card : 'rounded-2xl flex-col items-center justify-center p-3 w-[100px] h-[100px] text-center bg-white/[0.02] border border-white/5 backdrop-blur-sm',
            
            // Border styling
            status === 'morphing'
              ? ''
              : status === 'purging_likes' && user.has_liked
              ? 'border border-emerald-500/40'
              : status === 'purging_likes' && !user.has_liked
              ? 'border border-red-900/40'
              : status === 'purging_follows' && checkedUserIds[user.id] === 'follower'
              ? 'border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
              : status === 'purging_follows' && checkedUserIds[user.id] === 'non-follower'
              ? 'border border-red-900/40'
              : 'border border-white/5',

            // Background styling
            status === 'morphing'
              ? ''
              : status === 'purging_likes' && user.has_liked
              ? 'bg-emerald-950/20'
              : status === 'purging_likes' && !user.has_liked
              ? 'bg-red-950/10'
              : status === 'purging_follows' && checkedUserIds[user.id] === 'follower'
              ? 'bg-emerald-950/20'
              : status === 'purging_follows' && checkedUserIds[user.id] === 'non-follower'
              ? 'bg-red-950/10'
              : 'bg-white/[0.03]',

            // Grayscale / Opacity / Scale for eliminated cards
            (status === 'purging_likes' && !user.has_liked) || (status === 'purging_follows' && checkedUserIds[user.id] === 'non-follower')
              ? 'grayscale opacity-25 scale-95'
              : ''
          ]"
        >
          <!-- Elimination Indicator Badges -->
          <div 
            v-if="status === 'purging_likes' && !user.has_liked"
            class="absolute top-0.5 right-0.5 bg-red-500/90 text-white rounded-full p-0.5 animate-pulse z-10 scale-75"
          >
            <Icon name="mdi:heart-off" class="w-3.5 h-3.5" />
          </div>
          <div 
            v-if="status === 'purging_follows' && checkedUserIds[user.id] === 'non-follower'" 
            class="absolute top-0.5 right-0.5 bg-red-500/90 text-white rounded-full p-0.5 animate-pulse z-10 scale-75"
          >
            <Icon name="mdi:account-remove" class="w-3.5 h-3.5" />
          </div>

          <!-- Entrant Avatar -->
          <div 
            class="relative transition-all duration-700 ease-in-out flex-shrink-0"
            :class="status !== 'morphing' ? cardStyles.avatar : 'w-20 h-20 mb-1.5'"
          >
            <img 
              :src="user.avatar" 
              class="w-full h-full object-cover border border-slate-700 shadow-sm rounded-full"
              :class="{
                'border-emerald-400': (status === 'purging_likes' && user.has_liked) || (status === 'purging_follows' && checkedUserIds[user.id] === 'follower')
              }"
              @error="handleAvatarError($event, user.username)"
              alt="Avatar"
            />
            <!-- Status mini indicator dots (only on larger grids) -->
            <div 
              v-if="status !== 'morphing' && gridStyles.cols <= 3" 
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
          <div 
            class="flex-1 min-w-0 transition-all duration-700 ease-in-out text-left"
            :class="status === 'morphing' ? 'text-center w-full' : ''"
          >
            <div 
              class="font-bold text-slate-100 truncate tracking-tight transition-all duration-700"
              :class="status !== 'morphing' ? cardStyles.username : 'text-[12px] text-slate-400 font-bold w-full truncate'"
            >
              {{ user.username }}
            </div>
            
            <!-- Comment (Fades out and collapses based on styling) -->
            <div 
              v-if="status !== 'morphing' && cardStyles.comment !== 'hidden'"
              :class="cardStyles.comment"
            >
              {{ user.comment }}
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
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useGiveawayStore, type Entrant } from '~/stores/giveaway'

const store = useGiveawayStore()
const status = computed(() => store.status)

// Local array to handle staggered loading entry animation
const displayedUsers = ref<Entrant[]>([])
const showFollowersPopover = ref(false)
const checkedUserIds = ref<Record<string, 'follower' | 'non-follower'>>({})
const scrollContainer = ref<HTMLDivElement | null>(null)

// Titles depending on the state
const phaseTitle = computed(() => {
  switch (status.value) {
    case 'revealing': return 'RÉVÉLATION INITIALE'
    case 'purging_likes': return 'ÉTAPE 1 : FILTRE DES J\'AIME'
    case 'purging_follows': return 'ÉTAPE 2 : FILTRE DES ABONNÉS'
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

// Dynamic card inner class styles
const cardStyles = computed(() => {
  const cols = gridStyles.value.cols
  
  if (cols === 2) {
    return {
      card: 'p-3 flex-row items-center gap-3 h-16 rounded-xl w-full',
      avatar: 'w-10 h-10',
      username: 'text-[11px] font-bold text-slate-100',
      comment: 'text-[9px] block text-slate-400 mt-0.5 truncate'
    }
  } else if (cols === 3) {
    return {
      card: 'p-2 flex-row items-center gap-2 h-12 rounded-xl w-full',
      avatar: 'w-7.5 h-7.5',
      username: 'text-[10px] font-bold text-slate-100',
      comment: 'text-[8px] block text-slate-400 truncate mt-0.5'
    }
  } else if (cols === 4) {
    return {
      card: 'p-1.5 flex-col items-center justify-center text-center h-16 rounded-lg w-full',
      avatar: 'w-7.5 h-7.5 mb-1',
      username: 'text-[8.5px] font-bold text-slate-100 w-full truncate',
      comment: 'hidden'
    }
  } else if (cols === 5) {
    return {
      card: 'p-1 flex-col items-center justify-center text-center h-14 rounded-lg w-full',
      avatar: 'w-6.5 h-6.5 mb-0.5',
      username: 'text-[7.5px] font-bold text-slate-200 w-full truncate',
      comment: 'hidden'
    }
  } else if (cols === 6) {
    return {
      card: 'p-0.5 flex-col items-center justify-center text-center h-11 rounded-md w-full border-white/5',
      avatar: 'w-5.5 h-5.5 mb-0.5',
      username: 'text-[6.5px] font-bold text-slate-200 w-full truncate',
      comment: 'hidden'
    }
  } else {
    return {
      card: 'p-0.5 flex-col items-center justify-center text-center h-9.5 rounded-md w-full border-white/5',
      avatar: 'w-5 h-5 mb-0.5',
      username: 'text-[5.5px] font-medium text-slate-300 w-full truncate',
      comment: 'hidden'
    }
  }
})

// Trigger staggered display of store users
function staggerReveal() {
  displayedUsers.value = []
  const rawUsers = [...store.users]
  updateLockedCols(rawUsers.length)
  let idx = 0
  
  function addNext() {
    if (idx < rawUsers.length && status.value === 'revealing') {
      const user = rawUsers[idx]
      if (user) {
        displayedUsers.value.push(user)
      }
      idx++
      
      // Auto grid rearrangement animates automatically via CSS and columns computed
      setTimeout(addNext, 35)
    }
  }
  
  addNext()
}

onMounted(() => {
  updateLockedCols(store.users.length)
  if (status.value === 'revealing') {
    staggerReveal()
  } else {
    displayedUsers.value = [...store.users]
  }
})

// Sync local users list with store when purges remove items
watch(() => store.users, (newUsers) => {
  // We only replace directly if we are not currently staggering the reveal
  if (status.value !== 'revealing') {
    displayedUsers.value = [...newUsers]
  } else {
    updateLockedCols(newUsers.length)
  }
}, { deep: true })

watch(status, (newStatus) => {
  if (newStatus === 'revealing') {
    updateLockedCols(store.users.length)
    staggerReveal()
  }

  if (newStatus === 'purging_follows') {
    checkedUserIds.value = {}
    const rawUsers = [...displayedUsers.value]
    if (rawUsers.length > 0) {
      // Calculate dynamic interval to fit checking inside the dynamic phase duration
      // Phase duration in store is: Math.max(1500, users.value.length * 85)
      const phaseDuration = Math.max(1500, rawUsers.length * 85)
      const checkInterval = (phaseDuration - 300) / rawUsers.length
      let idx = 0
      
      function checkNext() {
        if (idx < rawUsers.length && status.value === 'purging_follows') {
          const user = rawUsers[idx]
          if (user) {
            // Re-assign object to trigger ref reactivity explicitly
            checkedUserIds.value = { 
              ...checkedUserIds.value, 
              [user.id]: user.is_follower ? 'follower' : 'non-follower' 
            }
            
            setTimeout(() => {
              idx++
              checkNext()
            }, checkInterval)
          }
        } else if (idx >= rawUsers.length && status.value === 'purging_follows') {
          const allFollowers = rawUsers.every(u => u.is_follower)
          if (allFollowers && rawUsers.length > 0) {
            showFollowersPopover.value = true
            setTimeout(() => {
              showFollowersPopover.value = false
            }, 1800)
          }
        }
      }
      
      checkNext()
    }
  } else {
    showFollowersPopover.value = false
    checkedUserIds.value = {}
  }
})
</script>

<style scoped>
/* Card layout/dimensions transition rules */
.card-transition {
  transition: all 0.7s cubic-bezier(0.25, 1, 0.5, 1);
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

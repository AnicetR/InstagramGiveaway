import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Entrant {
  id: string
  username: string
  avatar: string
  comment: string
  has_liked: boolean
  is_follower: boolean
}

export interface ScrapedAccount {
  username: string
  avatar: string
  followers: string[]
  followersCount: number
  scrapedAt: number
}

export interface ScrapedPost {
  url: string
  ownerUsername: string
  scrapedAt: number
  users: Entrant[]
}

export type GiveawayStatus =
  | 'idle'
  | 'fetching'
  | 'revealing'
  | 'purging_likes'
  | 'purging_follows'
  | 'morphing'
  | 'spinning'
  | 'victory'
  | 'error'

export const useGiveawayStore = defineStore('giveaway', () => {
  const status = ref<GiveawayStatus>('idle')
  const url = ref<string>('')
  const users = ref<Entrant[]>([])
  const winner = ref<Entrant | null>(null)
  const errorMsg = ref<string | null>(null)

  // Cache of original entrants for history or debugging
  const originalUsers = ref<Entrant[]>([])

  // Setup / Extension / Scraped data states
  const isExtensionLoaded = ref(false)
  const scrapedAccounts = ref<ScrapedAccount[]>([])
  const selectedAccount = ref<ScrapedAccount | null>(null)
  const scrapedPosts = ref<ScrapedPost[]>([])
  const selectedPost = ref<ScrapedPost | null>(null)
  const checkLikes = ref(false)
  const checkFollowers = ref(true)

  // Active timeouts tracking for cleanups
  const activeTimeouts = ref<any[]>([])

  const filteredPosts = computed(() => {
    if (!selectedAccount.value) return []
    return scrapedPosts.value.filter(post => {
      if (!post.ownerUsername) return true
      if (!selectedAccount.value?.username) return false
      return post.ownerUsername.toLowerCase().trim() === selectedAccount.value.username.toLowerCase().trim()
    })
  })

  function registerTimeout(fn: () => void, delay: number) {
    const timeout = setTimeout(() => {
      activeTimeouts.value = activeTimeouts.value.filter(t => t !== timeout)
      fn()
    }, delay)
    activeTimeouts.value.push(timeout)
    return timeout
  }

  function clearAllTimeouts() {
    activeTimeouts.value.forEach(t => clearTimeout(t))
    activeTimeouts.value = []
  }

  function reset() {
    clearAllTimeouts()
    status.value = 'idle'
    url.value = ''
    users.value = []
    winner.value = null
    errorMsg.value = null
    originalUsers.value = []
  }

  function setStatus(newStatus: GiveawayStatus) {
    status.value = newStatus
  }

  function purgeNonLikers() {
    users.value = users.value.filter(u => u.has_liked)
  }

  function purgeNonFollowers() {
    users.value = users.value.filter(u => u.is_follower)
  }

  function toggleRule(rule: 'likes' | 'followers') {
    if (rule === 'likes') {
      checkLikes.value = !checkLikes.value
    } else if (rule === 'followers') {
      checkFollowers.value = !checkFollowers.value
    }
  }

  function selectAccount(account: ScrapedAccount | null) {
    selectedAccount.value = account
  }

  function selectPost(post: ScrapedPost | null) {
    selectedPost.value = post
  }

  function selectRandomWinner() {
    if (users.value.length === 0) {
      winner.value = null
      return null
    }
    while (winner.value === null) {
      const randomIndex = Math.floor(Math.random() * users.value.length)
      winner.value = users.value[randomIndex] ?? null
    }
    return winner.value
  }

  function startDrawing(checkLikesVal?: boolean, checkFollowersVal?: boolean) {
    if (checkLikesVal !== undefined) checkLikes.value = checkLikesVal
    if (checkFollowersVal !== undefined) checkFollowers.value = checkFollowersVal

    if (!selectedPost.value) return

    clearAllTimeouts()

    const preparedUsers = (selectedPost.value.users || []).map((u: any) => {
      let is_follower = true
      if (checkFollowers.value) {
        if (u.is_follower !== undefined) {
          is_follower = u.is_follower
        } else if (selectedAccount.value?.followers && Array.isArray(selectedAccount.value.followers)) {
          is_follower = selectedAccount.value.followers.includes(u.username)
        } else {
          is_follower = Math.random() > 0.45
        }
      }

      const has_liked = checkLikes.value ? (u.has_liked !== undefined ? u.has_liked : true) : true

      return {
        ...u,
        has_liked,
        is_follower
      }
    })

    // Ensure there is at least one winner matching both checks
    if (preparedUsers.length > 0) {
      const validUsers = preparedUsers.filter((u: any) => u.has_liked && u.is_follower)
      if (validUsers.length === 0) {
        preparedUsers[0].has_liked = true
        preparedUsers[0].is_follower = true
      }
    }

    users.value = preparedUsers
    originalUsers.value = [...preparedUsers]
    url.value = selectedPost.value.url
    status.value = 'revealing'

    runTimeline()
  }

  function runTimeline() {
    const staggerDuration = users.value.length * 35
    const revealDelay = Math.max(2000, staggerDuration + 1200)

    registerTimeout(() => {
      if (status.value !== 'revealing') return

      if (checkLikes.value) {
        status.value = 'purging_likes'
        registerTimeout(() => {
          if (status.value !== 'purging_likes') return
          purgeNonLikers()
          registerTimeout(checkNextPhaseAfterLikes, 1800)
        }, 1500)
      } else {
        checkNextPhaseAfterLikes()
      }
    }, revealDelay)
  }

  function checkNextPhaseAfterLikes() {
    if (checkFollowers.value) {
      status.value = 'purging_follows'
      const userCount = users.value.length
      const phaseDuration = userCount > 0 ? Math.max(1500, 2500 / userCount) : 1500
      const followPurgeDelay = phaseDuration - 300
      registerTimeout(() => {
        if (status.value !== 'purging_follows') return
        purgeNonFollowers()
        registerTimeout(transitionToSpinning, 1800)
      }, followPurgeDelay)
    } else {
      transitionToSpinning()
    }
  }

  function transitionToSpinning() {
    status.value = 'spinning'
  }

  return {
    status,
    url,
    users,
    winner,
    errorMsg,
    originalUsers,
    isExtensionLoaded,
    scrapedAccounts,
    selectedAccount,
    scrapedPosts,
    selectedPost,
    checkLikes,
    checkFollowers,
    filteredPosts,
    reset,
    setStatus,
    purgeNonLikers,
    purgeNonFollowers,
    toggleRule,
    selectAccount,
    selectPost,
    selectRandomWinner,
    startDrawing
  }
})

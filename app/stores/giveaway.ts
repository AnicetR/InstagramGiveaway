import { defineStore } from 'pinia'
import { ref } from 'vue'

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

  function reset() {
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

  async function startExtraction(targetUrl: string) {
    url.value = targetUrl
    status.value = 'fetching'
    errorMsg.value = null

    try {
      const response = await $fetch<{ success: boolean; data: Entrant[]; error?: string }>('/api/giveaway/extract', {
        method: 'POST',
        body: { url: targetUrl }
      })

      if (response && response.success && Array.isArray(response.data)) {
        users.value = response.data
        originalUsers.value = [...response.data]

        if (users.value.length === 0) {
          throw new Error('Aucun participant trouvé pour cette publication Instagram.')
        }

        status.value = 'revealing'
      } else {
        throw new Error(response.error || 'Échec de l\'extraction des données du concours.')
      }
    } catch (err: any) {
      status.value = 'error'
      errorMsg.value = err.message || 'Une erreur inattendue est survenue lors de l\'extraction.'
      console.error('Extraction Error:', err)
    }
  }

  function purgeNonLikers() {
    users.value = users.value.filter(u => u.has_liked)
  }

  function purgeNonFollowers() {
    users.value = users.value.filter(u => u.is_follower)
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

  return {
    status,
    url,
    users,
    winner,
    errorMsg,
    originalUsers,
    reset,
    setStatus,
    startExtraction,
    purgeNonLikers,
    purgeNonFollowers,
    selectRandomWinner
  }
})

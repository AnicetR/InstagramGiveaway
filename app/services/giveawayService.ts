import { useGiveawayStore } from '~/stores/giveaway'
import * as mockService from './giveawayMock'

class GiveawayService {
  private pingInterval: any = null
  private messageListener: ((event: MessageEvent) => void) | null = null

  public init() {
    const store = useGiveawayStore()

    // Check if we still have the old localStorage import (backup helper)
    const importedDataStr = localStorage.getItem('insta_giveaway_scraped_data')
    if (importedDataStr) {
      try {
        const payload = JSON.parse(importedDataStr)
        localStorage.removeItem('insta_giveaway_scraped_data')
        if (payload && Array.isArray(payload.users) && payload.users.length > 0) {
          store.selectedPost = {
            url: payload.url || '',
            ownerUsername: payload.ownerUsername || '',
            scrapedAt: Date.now(),
            users: payload.users
          }
        }
      } catch (e) {
        console.error(e)
      }
    }

    // Ping Chrome extension
    let pingAttempts = 0
    this.pingInterval = setInterval(() => {
      window.postMessage({ type: 'PING_EXTENSION' }, '*')
      pingAttempts++
      if (pingAttempts > 15 && !store.isExtensionLoaded) {
        if (this.pingInterval) {
          clearInterval(this.pingInterval)
        }
      }
    }, 250)

    // Listen to bridge messages
    this.messageListener = (event: MessageEvent) => {
      if (event.source !== window) return
      const { type, posts, accounts } = event.data

      if (type === 'EXTENSION_PONG') {
        store.isExtensionLoaded = true
        if (this.pingInterval) {
          clearInterval(this.pingInterval)
        }
        // Retrieve list of posts and accounts from extension
        window.postMessage({ type: 'GET_SCRAPED_DATA' }, '*')
      } else if (type === 'SCRAPED_POSTS_RESPONSE') {
        store.scrapedPosts = posts || []
      } else if (type === 'SCRAPED_DATA_RESPONSE') {
        store.scrapedPosts = posts || []
        store.scrapedAccounts = accounts || []

        // If selected account is no longer in the list, reset it
        if (store.selectedAccount && !store.scrapedAccounts.some(a => a.username === store.selectedAccount?.username)) {
          store.selectedAccount = null
        }

        // If selected post is no longer in the list, reset it
        if (store.selectedPost && !store.scrapedPosts.some(p => p.url === store.selectedPost?.url)) {
          store.selectedPost = null
        }
      }
    }

    window.addEventListener('message', this.messageListener)
  }

  public destroy() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
    }
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener)
      this.messageListener = null
    }
  }

  public deletePost(url: string) {
    window.postMessage({ type: 'DELETE_SCRAPED_POST', data: { url } }, '*')
  }

  public deleteAccount(username: string) {
    window.postMessage({ type: 'DELETE_SCRAPED_ACCOUNT', data: { username } }, '*')
  }

  public refreshData() {
    window.postMessage({ type: 'GET_SCRAPED_DATA' }, '*')
  }

  public loadDemoData() {
    const store = useGiveawayStore()
    store.isExtensionLoaded = true
    store.scrapedAccounts = mockService.getMockAccounts()
    store.scrapedPosts = mockService.getMockPosts()
  }
}

export const giveawayService = new GiveawayService()

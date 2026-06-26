import { useGiveawayStore } from '~/stores/giveaway'
import * as mockService from '~/services/giveawayMock'

/**
 * Allowed message types for communication through the postMessage bridge
 * between the Nuxt web application and the Chrome Extension companion.
 */
export type BridgeMessageType =
  | 'PING_EXTENSION'
  | 'EXTENSION_PONG'
  | 'GET_SCRAPED_DATA'
  | 'GET_SCRAPED_POSTS'
  | 'SCRAPED_POSTS_RESPONSE'
  | 'SCRAPED_DATA_RESPONSE'
  | 'DELETE_SCRAPED_POST'
  | 'DELETE_SCRAPED_ACCOUNT'

/**
 * Structure of messages exchanged through the postMessage bridge.
 */
export interface BridgeMessage {
  type: BridgeMessageType
  posts?: unknown
  accounts?: unknown
  data?: any
}

/**
 * Service to manage the connection, event listeners, and data exchange
 * between the Instagram Giveaway web app and the Chrome Extension companion.
 */
class GiveawayService {
  private pingInterval: ReturnType<typeof setInterval> | null = null
  private messageListener: ((event: MessageEvent<BridgeMessage>) => void) | null = null

  /**
   * Initializes the service:
   * 1. Cleans up existing listener/timer to prevent double initialization.
   * 2. Checks local storage for legacy backup data.
   * 3. Sets up the Chrome extension ping interval.
   * 4. Registers the postMessage event listener.
   */
  public init(): void {
    // Prevent duplicate initializations
    this.destroy()

    const store = useGiveawayStore()

    // Check if we still have the old localStorage import (backup helper)
    try {
      const importedDataStr = localStorage.getItem('insta_giveaway_scraped_data')
      if (importedDataStr) {
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
      }
    } catch (e) {
      console.error('Failed to import legacy localStorage data:', e)
    }

    // Ping Chrome extension
    let pingAttempts = 0
    this.pingInterval = setInterval(() => {
      window.postMessage({ type: 'PING_EXTENSION' }, '*')
      pingAttempts++
      if (pingAttempts > 15 && !store.isExtensionLoaded) {
        if (this.pingInterval) {
          clearInterval(this.pingInterval)
          this.pingInterval = null
        }
      }
    }, 250)

    // Listen to bridge messages
    this.messageListener = (event: MessageEvent<BridgeMessage>) => {
      if (event.source !== window) return

      const payload = event.data
      if (!payload || typeof payload !== 'object') return

      const { type, posts, accounts } = payload

      if (type === 'EXTENSION_PONG') {
        store.isExtensionLoaded = true
        if (this.pingInterval) {
          clearInterval(this.pingInterval)
          this.pingInterval = null
        }
        // Retrieve list of posts and accounts from extension
        window.postMessage({ type: 'GET_SCRAPED_DATA' }, '*')
      } else if (type === 'SCRAPED_POSTS_RESPONSE') {
        store.scrapedPosts = this.parsePayloadList(posts)
      } else if (type === 'SCRAPED_DATA_RESPONSE') {
        store.scrapedPosts = this.parsePayloadList(posts)
        store.scrapedAccounts = this.parsePayloadList(accounts)

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

  /**
   * Clears timers and removes the message event listener to prevent memory leaks.
   */
  public destroy(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener)
      this.messageListener = null
    }
  }

  /**
   * Normalizes and parses incoming raw data payload lists (e.g., posts, accounts).
   * Supports arrays, JSON stringified lists, or chunked character lists.
   *
   * @param data Raw payload data to parse
   * @returns List of parsed objects
   */
  private parsePayloadList(data: unknown): any[] {
    if (!data) return []

    // If data is already an array
    if (Array.isArray(data)) {
      if (data.length === 0 || typeof data[0] === 'object') {
        return data
      }
      // If data is a character/string chunk array representing stringified JSON
      if (typeof data[0] === 'string') {
        try {
          const str = data.join('')
          const parsed = JSON.parse(str)
          return Array.isArray(parsed) ? parsed : Object.values(parsed)
        } catch (e) {
          console.error("Failed to parse character array as JSON:", e)
          return []
        }
      }
    }

    // If data is a JSON stringified list
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data)
        return Array.isArray(parsed) ? parsed : Object.values(parsed)
      } catch (e) {
        console.error("Failed to parse string as JSON:", e)
        return []
      }
    }

    return []
  }

  /**
   * Signals the extension companion to delete a specific post from local storage.
   *
   * @param url Instagram URL of the scraped post to delete
   */
  public deletePost(url: string): void {
    window.postMessage({ type: 'DELETE_SCRAPED_POST', data: { url } }, '*')
  }

  /**
   * Signals the extension companion to delete a specific account from local storage.
   *
   * @param username Instagram username of the scraped account to delete
   */
  public deleteAccount(username: string): void {
    window.postMessage({ type: 'DELETE_SCRAPED_ACCOUNT', data: { username } }, '*')
  }

  /**
   * Requests latest scraped data from the extension storage.
   */
  public refreshData(): void {
    window.postMessage({ type: 'GET_SCRAPED_DATA' }, '*')
  }

  /**
   * Loads mocked data for development/demonstration purposes.
   */
  public loadDemoData(): void {
    const store = useGiveawayStore()
    store.isExtensionLoaded = true
    store.scrapedAccounts = mockService.getMockAccounts()
    store.scrapedPosts = mockService.getMockPosts()
  }
}

export const giveawayService = new GiveawayService()

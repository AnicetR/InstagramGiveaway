export function formatPostUrl(url: string) {
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

export function formatTimeAgo(timestamp: number) {
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

export function handleAvatarError(event: Event, username: string) {
  const img = event.target as HTMLImageElement
  const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444']
  let hash = 0
  const name = username || 'U'
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const color = colors[Math.abs(hash) % colors.length]
  const char = name.replace('@', '').charAt(0).toUpperCase() || 'U'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" fill="${color}"/><text x="50" y="65" font-family="Arial, sans-serif" font-size="50" font-weight="bold" fill="#ffffff" text-anchor="middle">${char}</text></svg>`
  img.src = 'data:image/svg+xml;base64,' + btoa(svg)
}

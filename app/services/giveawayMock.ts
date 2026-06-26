import type { Entrant, ScrapedAccount, ScrapedPost } from '~/stores/giveaway'

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

export function generateMockUsers(count: number): Entrant[] {
  const users: Entrant[] = []
  for (let i = 0; i < count; i++) {
    const username = MOCK_USERNAMES[i % MOCK_USERNAMES.length] + (i >= MOCK_USERNAMES.length ? `_${Math.floor(i / MOCK_USERNAMES.length)}` : '')
    users.push({
      id: `mock-${i}-${Math.random().toString(36).substring(2, 11)}`,
      username: `@${username}`,
      avatar: `https://i.pravatar.cc/150?u=${username}`,
      comment: MOCK_COMMENTS[Math.floor(Math.random() * MOCK_COMMENTS.length)],
      has_liked: Math.random() > 0.35,
      is_follower: Math.random() > 0.40
    })
  }
  return users
}

export function getMockAccounts(): ScrapedAccount[] {
  return [
    {
      username: '@patricerv',
      avatar: 'https://i.pravatar.cc/150?u=patricerv',
      followers: ['@pixel_nomad', '@luna_wanderlust', '@tech_pioneer', '@aurora_design', '@zen_developer', '@golden_hour_vibes'],
      followersCount: 1049,
      scrapedAt: Date.now() - 1000 * 60 * 60 * 24
    },
    {
      username: '@johnrachic',
      avatar: 'https://i.pravatar.cc/150?u=johnrachic',
      followers: ['@golden_hour_vibes', '@indie_hacker', '@neon_dreamer', '@code_artisan', '@coffee_n_compile', '@pixel_nomad'],
      followersCount: 3200,
      scrapedAt: Date.now() - 1000 * 60 * 60 * 48
    }
  ]
}

export function getMockPosts(): ScrapedPost[] {
  return [
    {
      url: 'https://www.instagram.com/p/mock_summer_giveaway/',
      ownerUsername: '@patricerv',
      scrapedAt: Date.now() - 1000 * 60 * 5, // 5 min ago
      users: generateMockUsers(60)
    },
    {
      url: 'https://www.instagram.com/p/mock_winter_contest/',
      ownerUsername: '@johnrachic',
      scrapedAt: Date.now() - 1000 * 60 * 60 * 2, // 2h ago
      users: generateMockUsers(45)
    }
  ]
}

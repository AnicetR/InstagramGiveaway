// Script de liaison s'exécutant sur http://localhost:3000/*
console.log("Roulette de Concours : Pont applicatif de l'extension chargé.");

// Écouter les messages provenant de l'application Nuxt
window.addEventListener('message', (event) => {
  // S'assurer que le message vient de notre propre page
  if (event.source !== window) return;

  const message = event.data;
  if (!message || typeof message !== 'object') return;

  const { type, data } = message;

  // Répondre au ping pour signaler que l'extension est présente
  if (type === 'PING_EXTENSION') {
    window.postMessage({ type: 'EXTENSION_PONG' }, '*');
  }
  
  // Renvoyer tous les posts sauvegardés
  else if (type === 'GET_SCRAPED_POSTS') {
    chrome.storage.local.get('scrapedPosts', (result) => {
      const postsMap = result.scrapedPosts || {};
      const postsList = Object.values(postsMap).sort((a, b) => b.scrapedAt - a.scrapedAt);
      window.postMessage({ type: 'SCRAPED_POSTS_RESPONSE', posts: postsList }, '*');
    });
  }
  
  // Supprimer un post de la liste
  else if (type === 'DELETE_SCRAPED_POST') {
    if (data && data.url) {
      chrome.storage.local.get('scrapedPosts', (result) => {
        const postsMap = result.scrapedPosts || {};
        if (postsMap[data.url]) {
          delete postsMap[data.url];
          chrome.storage.local.set({ scrapedPosts: postsMap }, () => {
            const postsList = Object.values(postsMap).sort((a, b) => b.scrapedAt - a.scrapedAt);
            window.postMessage({ type: 'SCRAPED_POSTS_RESPONSE', posts: postsList }, '*');
          });
        }
      });
    }
  }
});

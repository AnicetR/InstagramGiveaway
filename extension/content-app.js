// Script de liaison s'exécutant sur http://localhost:3000/*
console.log("Roulette de Concours : Pont applicatif de l'extension chargé.");

// Fonction utilitaire pour récupérer toutes les données et les renvoyer à l'application web
function sendScrapedDataResponse() {
  chrome.storage.local.get(['scrapedPosts', 'scrapedAccounts'], (result) => {
    const postsMap = result.scrapedPosts || {};
    const postsList = Object.values(postsMap).sort((a, b) => b.scrapedAt - a.scrapedAt);
    
    const accountsMap = result.scrapedAccounts || {};
    const accountsList = Object.values(accountsMap).sort((a, b) => b.scrapedAt - a.scrapedAt);
    
    window.postMessage({ 
      type: 'SCRAPED_DATA_RESPONSE', 
      posts: postsList, 
      accounts: accountsList 
    }, '*');
  });
}

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
  
  // Renvoyer toutes les données sauvegardées (posts et comptes)
  else if (type === 'GET_SCRAPED_POSTS' || type === 'GET_SCRAPED_DATA') {
    sendScrapedDataResponse();
  }
  
  // Supprimer un post de la liste
  else if (type === 'DELETE_SCRAPED_POST') {
    if (data && data.url) {
      chrome.storage.local.get('scrapedPosts', (result) => {
        const postsMap = result.scrapedPosts || {};
        if (postsMap[data.url]) {
          delete postsMap[data.url];
          chrome.storage.local.set({ scrapedPosts: postsMap }, () => {
            sendScrapedDataResponse();
          });
        }
      });
    }
  }
  
  // Supprimer un compte de la liste
  else if (type === 'DELETE_SCRAPED_ACCOUNT') {
    if (data && data.username) {
      chrome.storage.local.get('scrapedAccounts', (result) => {
        const accountsMap = result.scrapedAccounts || {};
        if (accountsMap[data.username]) {
          delete accountsMap[data.username];
          chrome.storage.local.set({ scrapedAccounts: accountsMap }, () => {
            sendScrapedDataResponse();
          });
        }
      });
    }
  }
});

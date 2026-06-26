// Script de liaison s'exécutant sur http://localhost:3000/*
console.log("Instagram Giveaway : Pont applicatif de l'extension chargé.");

// Fonction utilitaire pour récupérer toutes les données et les renvoyer à l'application web
function sendScrapedDataResponse() {
  chrome.storage.local.get(['scrapedPosts', 'scrapedAccounts'], (result) => {
    let postsMap = result.scrapedPosts || {};
    if (typeof postsMap === 'string') {
      try {
        postsMap = JSON.parse(postsMap);
      } catch (e) {
        postsMap = {};
      }
    }
    const postsList = Array.isArray(postsMap) 
      ? postsMap 
      : Object.values(postsMap).sort((a, b) => b.scrapedAt - a.scrapedAt);
    
    let accountsMap = result.scrapedAccounts || {};
    if (typeof accountsMap === 'string') {
      try {
        accountsMap = JSON.parse(accountsMap);
      } catch (e) {
        accountsMap = {};
      }
    }
    const accountsList = Array.isArray(accountsMap)
      ? accountsMap
      : Object.values(accountsMap).sort((a, b) => b.scrapedAt - a.scrapedAt);
    
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
        let postsMap = result.scrapedPosts || {};
        if (typeof postsMap === 'string') {
          try {
            postsMap = JSON.parse(postsMap);
          } catch (e) {
            postsMap = {};
          }
        }
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
        let accountsMap = result.scrapedAccounts || {};
        if (typeof accountsMap === 'string') {
          try {
            accountsMap = JSON.parse(accountsMap);
          } catch (e) {
            accountsMap = {};
          }
        }
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

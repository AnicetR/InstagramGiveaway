// Content script pour l'extraction des commentaires Instagram (scrolling natif résilient)
console.log("Roulette de Concours : Script de contenu injecté.");

// Fonction résiliente pour trouver le conteneur de défilement des commentaires
// Conteneur de défilement inutile en extraction manuelle / instantanée

// Fonction principale de scraping DOM (commentaires de premier niveau uniquement)
function performExtraction() {
  const comments = [];
  const seenComments = new Set();
  
  // Ignorer les chemins système Instagram
  const ignoredUsernames = new Set(['explore', 'reels', 'direct', 'stories', 'emails', 'developer', 'about', 'blog', 'jobs', 'help', 'api', 'privacy', 'terms', 'directory', 'locations', 'instagram', 'p', 'reel', 'tv']);
  
  // Rechercher tous les liens de profils dans la page
  const profileAnchors = Array.from(document.querySelectorAll('a[href*="instagram.com/"], a[href^="/"]'));
  
  for (const anchor of profileAnchors) {
    const href = anchor.getAttribute('href');
    if (!href) continue;
    
    // Extraire le nom d'utilisateur avec URL (robuste aux paramètres de requête et URLs absolues)
    let username = '';
    try {
      let urlObj;
      if (href.startsWith('http://') || href.startsWith('https://')) {
        urlObj = new URL(href);
      } else {
        const relativePath = href.startsWith('/') ? href : '/' + href;
        urlObj = new URL(relativePath, window.location.origin);
      }
      
      const pathParts = urlObj.pathname.split('/').filter(p => p);
      if (pathParts.length === 1) {
        username = pathParts[0];
      }
    } catch (e) {
      continue;
    }
    
    if (!username || ignoredUsernames.has(username.toLowerCase())) continue;
    
    // FILTRE DES SOUS-COMMENTAIRES (RÉPONSES)
    // On ignore les commentaires imbriqués (réponses)
    let isReply = false;
    let parent = anchor.parentElement;
    while (parent) {
      if (parent.tagName === 'UL') {
        // Si ce UL est imbriqué dans un LI, c'est une liste de réponses
        let ulParent = parent.parentElement;
        let depth = 0;
        while (ulParent && depth < 3) {
          if (ulParent.tagName === 'LI') {
            isReply = true;
            break;
          }
          ulParent = ulParent.parentElement;
          depth++;
        }
        if (isReply) break;
      }
      parent = parent.parentElement;
    }
    if (isReply) continue;
    
    // Trouver le conteneur du commentaire (le LI ou un div parent proche)
    let commentRow = null;
    let curr = anchor.parentElement;
    for (let i = 0; i < 4 && curr; i++) {
      if (curr.tagName === 'LI' || curr.classList.contains('x78zum5')) {
        commentRow = curr;
        break;
      }
      curr = curr.parentElement;
    }
    
    if (!commentRow) {
      commentRow = anchor.parentElement;
    }
    
    if (!commentRow) continue;
    
    // Extraire le texte du commentaire à partir des feuilles de texte du conteneur
    const elements = commentRow.querySelectorAll('span, div');
    let commentText = '';
    
    for (const el of elements) {
      if (el.children.length > 0) continue;
      if (anchor.contains(el)) continue;
      
      const txt = el.textContent.trim();
      if (!txt) continue;
      
      // Filtrer les termes techniques et d'interface utilisateur d'Instagram (multilingue)
      const lowercaseTxt = txt.toLowerCase();
      if (
        lowercaseTxt === 'répondre' || 
        lowercaseTxt === 'reply' || 
        lowercaseTxt === 'responder' || 
        lowercaseTxt === 'voir la traduction' || 
        lowercaseTxt === 'see translation' || 
        lowercaseTxt === 'ver traducción' || 
        lowercaseTxt === 'masquer' || 
        lowercaseTxt === 'hide' ||
        lowercaseTxt === 'ocultar' ||
        lowercaseTxt === 'afficher' || 
        lowercaseTxt === 'show' ||
        lowercaseTxt === 'mostrar' ||
        lowercaseTxt === username.toLowerCase() ||
        txt.match(/^\d+ (j|h|sem|sem\.|d|w|m)$/) ||
        txt.match(/^\d+(j|h|sem|sem\.|d|w|m)$/) ||
        lowercaseTxt.includes('afficher les réponses') ||
        lowercaseTxt.includes('voir les réponses') ||
        lowercaseTxt.includes('view replies') ||
        lowercaseTxt.includes('ver respuestas') ||
        lowercaseTxt.includes('hide replies') ||
        lowercaseTxt.includes('j’aime') ||
        lowercaseTxt.includes('me gusta') ||
        lowercaseTxt.includes('likes') || 
        txt.match(/^\d+$/)
      ) {
        continue;
      }
      
      if (txt.length > commentText.length) {
        commentText = txt;
      }
    }
    
    if (!commentText || commentText.toLowerCase() === username.toLowerCase()) continue;
    
    const uniqueKey = `${username.toLowerCase()}:${commentText}`;
    if (seenComments.has(uniqueKey)) continue;
    seenComments.add(uniqueKey);
    
    // Récupérer l'avatar si présent
    let avatarUrl = '';
    const avatarImg = commentRow.querySelector('img[src*="cdninstagram.com"], img[src*="instagram.com"]');
    if (avatarImg) {
      avatarUrl = avatarImg.src;
    }
    
    comments.push({
      id: `ext-${username}-${Math.random().toString(36).substr(2, 9)}`,
      username: `@${username}`,
      avatar: avatarUrl || `https://i.pravatar.cc/150?u=${username}`,
      comment: commentText,
      has_liked: true,
      is_follower: true
    });
  }
  
  return comments;
}

// Configuration GraphQL
const PARENT_QUERY_HASH = "97b41c52301f77ce508f55e66d17620e";
const INSTAGRAM_APP_ID = "936619743392459";

// Extraire le shortcode depuis l'URL de la page
function extractShortcode() {
  const m = window.location.pathname.match(/\/(?:reel|p)\/([^/]+)/);
  return m ? m[1] : null;
}

// Fonction d'extraction GraphQL asynchrone avec pagination
async function extractAllCommentsGraphQL() {
  const shortcode = extractShortcode();
  if (!shortcode) {
    throw new Error("Impossible de trouver le code de la publication dans l'URL.");
  }
  
  const comments = [];
  const seenComments = new Set();
  let hasNext = true;
  let cursor = null;
  
  console.log(`Début de l'extraction GraphQL pour le shortcode: ${shortcode}`);
  
  while (hasNext) {
    const variables = {
      shortcode: shortcode,
      first: 50
    };
    if (cursor) {
      variables.after = cursor;
    }
    
    const varStr = encodeURIComponent(JSON.stringify(variables));
    const url = `https://www.instagram.com/graphql/query/?query_hash=${PARENT_QUERY_HASH}&variables=${varStr}`;
    
    const response = await fetch(url, {
      headers: {
        "X-IG-App-ID": INSTAGRAM_APP_ID,
        "X-Requested-With": "XMLHttpRequest"
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP Instagram : ${response.status}`);
    }
    
    const data = await response.json();
    const media = data?.data?.shortcode_media;
    if (!media) {
      throw new Error("Session Instagram invalide, expirée ou publication privée.");
    }
    
    const edgeInfo = media.edge_media_to_parent_comment;
    const edges = edgeInfo?.edges || [];
    const pageInfo = edgeInfo?.page_info || {};
    
    for (const edge of edges) {
      const node = edge?.node;
      if (!node) continue;
      
      const username = node.owner?.username;
      const text = node.text;
      const avatarUrl = node.owner?.profile_pic_url;
      const id = node.id;
      
      if (!username || !text) continue;
      
      const uniqueKey = `${username.toLowerCase()}:${text}`;
      if (seenComments.has(uniqueKey)) continue;
      seenComments.add(uniqueKey);
      
      comments.push({
        id: id || `ext-${username}-${Math.random().toString(36).substr(2, 9)}`,
        username: `@${username}`,
        avatar: avatarUrl || `https://i.pravatar.cc/150?u=${username}`,
        comment: text,
        has_liked: true,
        is_follower: true
      });
    }
    
    // Émettre la progression vers le popup
    chrome.runtime.sendMessage({ action: "extraction_progress", count: comments.length });
    
    hasNext = pageInfo.has_next_page || false;
    cursor = pageInfo.end_cursor || null;
    
    // Pause pour éviter d'être bloqué par Instagram (300 ms)
    if (hasNext) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  
  return comments;
}

// Écouteur de messages (extraction hybride API + Fallback DOM)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extract_comments") {
    extractAllCommentsGraphQL()
      .then(comments => {
        if (comments.length === 0) {
          console.warn("L'extraction GraphQL n'a renvoyé aucun résultat, tentative avec le DOM...");
          const domComments = performExtraction();
          sendResponse({ success: true, comments: domComments, method: "dom" });
        } else {
          sendResponse({ success: true, comments: comments, method: "graphql" });
        }
      })
      .catch(err => {
        console.error("L'extraction GraphQL a échoué, tentative de fallback DOM...", err);
        try {
          const domComments = performExtraction();
          sendResponse({ success: true, comments: domComments, method: "dom_fallback" });
        } catch (domErr) {
          sendResponse({ success: false, error: `GraphQL: ${err.message} | DOM: ${domErr.message}` });
        }
      });
    return true; // Garde le canal ouvert pour la réponse asynchrone
  }
});

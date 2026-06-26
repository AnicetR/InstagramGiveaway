// Popup script pour l'extension compagnon Roulette de Concours

let activeTab = null;
let isPostPage = false;
let isProfilePage = false;

// Variables pour l'état Publication
let currentComments = [];
let ownerUsername = null;

// Variables pour l'état Profil
let profileMetadata = null;
let currentFollowers = [];

// Sélecteurs UI communs
const wrongPageView = document.getElementById('wrong-page-view');
const activePostView = document.getElementById('active-post-view');
const activeProfileView = document.getElementById('active-profile-view');
const btnLaunchRoulette = document.getElementById('btn-launch-roulette');

// Sélecteurs UI - Publication
const postUrlEl = document.getElementById('post-url');
const commentCountEl = document.getElementById('comment-count');
const entrantListEl = document.getElementById('entrant-list');
const btnExtractCurrent = document.getElementById('btn-extract-current');
const statusMessage = document.getElementById('status-message');

// Sélecteurs UI - Profil
const profileUsernameEl = document.getElementById('profile-username');
const profileFollowersTotalEl = document.getElementById('profile-followers-total');
const profileScrapedStats = document.getElementById('profile-scraped-stats');
const profileFollowersScrapedEl = document.getElementById('profile-followers-scraped');
const btnExtractProfileFollowers = document.getElementById('btn-extract-profile-followers');
const profileStatusMessage = document.getElementById('profile-status-message');

// Écouteur global pour suivre la progression de l'extraction API
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "extraction_progress") {
    commentCountEl.textContent = message.count;
    statusMessage.textContent = `Extraction en cours... (${message.count} trouvés)`;
  } else if (message.action === "followers_progress") {
    profileScrapedStats.style.display = 'flex';
    profileFollowersScrapedEl.textContent = message.count;
    profileStatusMessage.textContent = `Extraction des abonnés... (${message.count} récupérés)`;
  }
});

// Au chargement du popup, vérifier l'onglet actif
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs || tabs.length === 0) return;
    
    activeTab = tabs[0];
    const url = activeTab.url || '';
    
    // Déterminer le type de page Instagram
    const pathParts = new URL(url).pathname.split('/').filter(p => p);
    
    isPostPage = url.includes('instagram.com/p/') || 
                 url.includes('instagram.com/reel/') || 
                 url.includes('instagram.com/tv/');
                 
    isProfilePage = !isPostPage && pathParts.length > 0 && 
                    !['explore', 'reels', 'direct', 'stories', 'emails', 'developer', 'about', 'blog', 'jobs', 'help', 'api', 'privacy', 'terms', 'directory', 'locations', 'instagram'].includes(pathParts[0].toLowerCase());
    
    // Injecter programmatiquement le content.js
    await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      files: ['content.js']
    });

    if (isPostPage) {
      initPostView(url);
    } else if (isProfilePage) {
      initProfileView();
    } else {
      showWrongPage();
    }
    
  } catch (error) {
    console.error("Erreur d'initialisation :", error);
    showWrongPage();
  }
});

// --- VUE PUBLICATION ---

async function initPostView(url) {
  wrongPageView.style.display = 'none';
  activeProfileView.style.display = 'none';
  activePostView.style.display = 'flex';
  
  const urlDisplay = url.split('?')[0];
  postUrlEl.textContent = urlDisplay;
  statusMessage.textContent = "Script d'extraction prêt.";
  
  // Charger les données précédemment sauvegardées si existantes
  try {
    const result = await chrome.storage.local.get('scrapedPosts');
    const scrapedPosts = result.scrapedPosts || {};
    const postData = scrapedPosts[urlDisplay];
    if (postData) {
      currentComments = postData.users || [];
      ownerUsername = postData.ownerUsername || null;
      updatePostUI();
      statusMessage.textContent = `Données chargées (${currentComments.length} commentaires extraits précédemment).`;
    }
  } catch (e) {
    console.error(e);
  }
}

btnExtractCurrent.addEventListener('click', async () => {
  statusMessage.textContent = "Extraction en cours...";
  btnExtractCurrent.disabled = true;
  btnLaunchRoulette.disabled = true;
  
  try {
    const response = await chrome.tabs.sendMessage(activeTab.id, { action: "extract_comments" });
    if (response && response.success) {
      currentComments = response.comments || [];
      ownerUsername = response.ownerUsername ? `@${response.ownerUsername.replace('@', '')}` : null;
      
      updatePostUI();
      
      const methodStr = response.method.startsWith("graphql") ? "via API" : "via DOM";
      statusMessage.textContent = `Extraction réussie (${currentComments.length} participants, ${methodStr}).`;
      
      await savePostToStorage();
    } else {
      statusMessage.textContent = response ? response.error : "Aucun commentaire trouvé.";
    }
  } catch (error) {
    console.error("Erreur d'extraction :", error);
    statusMessage.textContent = "Erreur de communication : veuillez réactualiser l'onglet Instagram.";
  } finally {
    btnExtractCurrent.disabled = false;
  }
});

async function savePostToStorage() {
  if (currentComments.length === 0) return;
  const postUrl = activeTab.url.split('?')[0];
  try {
    const result = await chrome.storage.local.get('scrapedPosts');
    const scrapedPosts = result.scrapedPosts || {};
    
    scrapedPosts[postUrl] = {
      url: postUrl,
      ownerUsername: ownerUsername,
      users: currentComments,
      scrapedAt: Date.now()
    };
    
    await chrome.storage.local.set({ scrapedPosts });
    console.log("Publication sauvegardée.");
  } catch (e) {
    console.error("Erreur de sauvegarde de la publication :", e);
  }
}

function updatePostUI() {
  commentCountEl.textContent = currentComments.length;
  
  if (currentComments.length > 0) {
    btnLaunchRoulette.disabled = false;
    btnLaunchRoulette.textContent = `Lancer le tirage sur ${currentComments.length} users`;
    
    entrantListEl.innerHTML = '';
    entrantListEl.style.display = 'flex';
    
    const previewCount = Math.min(5, currentComments.length);
    for (let i = 0; i < previewCount; i++) {
      const item = currentComments[i];
      const div = document.createElement('div');
      div.className = 'entrant-item';
      
      const img = document.createElement('img');
      img.className = 'entrant-avatar';
      img.src = item.avatar;
      img.onerror = () => { img.src = `https://i.pravatar.cc/50?u=${item.username}`; };
      
      const usernameSpan = document.createElement('span');
      usernameSpan.className = 'entrant-username';
      usernameSpan.textContent = item.username;
      
      const commentSpan = document.createElement('span');
      commentSpan.className = 'entrant-comment';
      commentSpan.textContent = item.comment;
      
      div.appendChild(img);
      div.appendChild(usernameSpan);
      div.appendChild(commentSpan);
      entrantListEl.appendChild(div);
    }
    
    if (currentComments.length > 5) {
      const moreDiv = document.createElement('div');
      moreDiv.style.fontSize = '9px';
      moreDiv.style.color = '#6b7280';
      moreDiv.style.textAlign = 'center';
      moreDiv.style.paddingTop = '2px';
      moreDiv.textContent = `... et ${currentComments.length - 5} autres participants`;
      entrantListEl.appendChild(moreDiv);
    }
  } else {
    btnLaunchRoulette.disabled = true;
    btnLaunchRoulette.textContent = "Lancer le Tirage";
    entrantListEl.style.display = 'none';
  }
}

btnLaunchRoulette.addEventListener('click', async () => {
  if (currentComments.length === 0) return;
  statusMessage.textContent = "Ouverture d'Instagram Giveaway...";
  try {
    await savePostToStorage();
    await chrome.tabs.create({ url: "http://localhost:3000/" });
  } catch (error) {
    statusMessage.textContent = "Erreur : " + error.message;
  }
});

// --- VUE PROFIL ---

async function initProfileView() {
  wrongPageView.style.display = 'none';
  activePostView.style.display = 'none';
  activeProfileView.style.display = 'flex';
  
  profileStatusMessage.textContent = "Récupération des métadonnées du profil...";
  btnExtractProfileFollowers.disabled = true;
  
  try {
    const response = await chrome.tabs.sendMessage(activeTab.id, { action: "get_profile_metadata" });
    if (response && response.success) {
      profileMetadata = response.metadata;
      
      profileUsernameEl.textContent = profileMetadata.username;
      profileFollowersTotalEl.textContent = profileMetadata.followersCount.toLocaleString();
      profileStatusMessage.textContent = "Profil chargé. Prêt à extraire les abonnés.";
      btnExtractProfileFollowers.disabled = false;
      
      // Charger les abonnés précédemment extraits si existants
      const result = await chrome.storage.local.get('scrapedAccounts');
      const scrapedAccounts = result.scrapedAccounts || {};
      const accountData = scrapedAccounts[profileMetadata.username];
      if (accountData) {
        currentFollowers = accountData.followers || [];
        profileScrapedStats.style.display = 'flex';
        profileFollowersScrapedEl.textContent = currentFollowers.length;
        profileStatusMessage.textContent = `Données chargées (${currentFollowers.length} abonnés extraits précédemment).`;
      }
    } else {
      profileStatusMessage.textContent = response ? response.error : "Impossible de charger les métadonnées.";
    }
  } catch (error) {
    console.error(error);
    profileStatusMessage.textContent = "Erreur de communication : réactualisez la page du profil.";
  }
}

btnExtractProfileFollowers.addEventListener('click', async () => {
  if (!profileMetadata) return;
  
  profileStatusMessage.textContent = "Initialisation de l'extraction des abonnés...";
  btnExtractProfileFollowers.disabled = true;
  profileScrapedStats.style.display = 'flex';
  
  try {
    const response = await chrome.tabs.sendMessage(activeTab.id, { 
      action: "extract_followers", 
      userId: profileMetadata.id 
    });
    
    if (response && response.success) {
      currentFollowers = response.followers || [];
      profileFollowersScrapedEl.textContent = currentFollowers.length;
      profileStatusMessage.textContent = `Extraction réussie (${currentFollowers.length} abonnés récupérés).`;
      await saveAccountToStorage();
    } else {
      profileStatusMessage.textContent = response ? response.error : "Erreur de récupération des abonnés.";
    }
  } catch (error) {
    console.error("Erreur abonnés :", error);
    profileStatusMessage.textContent = "Erreur de communication : réactualisez la page.";
  } finally {
    btnExtractProfileFollowers.disabled = false;
  }
});

async function saveAccountToStorage() {
  if (!profileMetadata || currentFollowers.length === 0) return;
  try {
    const result = await chrome.storage.local.get('scrapedAccounts');
    const scrapedAccounts = result.scrapedAccounts || {};
    
    scrapedAccounts[profileMetadata.username] = {
      username: profileMetadata.username,
      followers: currentFollowers,
      followersCount: profileMetadata.followersCount,
      avatar: profileMetadata.avatar,
      scrapedAt: Date.now()
    };
    
    await chrome.storage.local.set({ scrapedAccounts });
    console.log("Compte créateur sauvegardé.");
  } catch (e) {
    console.error("Erreur de sauvegarde du compte créateur :", e);
  }
}

// --- COMMUNE ---

function showWrongPage() {
  wrongPageView.style.display = 'flex';
  activePostView.style.display = 'none';
  activeProfileView.style.display = 'none';
}

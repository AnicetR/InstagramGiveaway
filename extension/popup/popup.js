// Popup script pour l'extension compagnon Roulette de Concours

let activeTab = null;
let currentComments = [];
let isExtracting = false;

// Sélecteurs d'éléments UI
const wrongPageView = document.getElementById('wrong-page-view');
const activePostView = document.getElementById('active-post-view');
const postUrlEl = document.getElementById('post-url');
const commentCountEl = document.getElementById('comment-count');
const entrantListEl = document.getElementById('entrant-list');
const btnExtractCurrent = document.getElementById('btn-extract-current');
const btnLaunchRoulette = document.getElementById('btn-launch-roulette');
const statusMessage = document.getElementById('status-message');

// Écouteur global pour suivre la progression de l'extraction API
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "extraction_progress") {
    commentCountEl.textContent = message.count;
    statusMessage.textContent = `Extraction en cours... (${message.count} trouvés)`;
  }
});

// Au chargement du popup, vérifier l'onglet actif
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs || tabs.length === 0) return;
    
    activeTab = tabs[0];
    const url = activeTab.url || '';
    
    // Vérifier si nous sommes sur un post Instagram
    const isInstagramPost = url.includes('instagram.com/p/') || 
                            url.includes('instagram.com/reel/') || 
                            url.includes('instagram.com/tv/');
                            
    if (!isInstagramPost) {
      wrongPageView.style.display = 'flex';
      activePostView.style.display = 'none';
      return;
    }
    
    wrongPageView.style.display = 'none';
    activePostView.style.display = 'flex';
    
    // Raccourcir l'URL pour l'affichage
    const urlDisplay = url.split('?')[0];
    postUrlEl.textContent = urlDisplay;
    
    statusMessage.textContent = "Initialisation du script d'extraction...";
    
    // Injecter programmatiquement le content.js
    await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      files: ['content.js']
    });
    
    statusMessage.textContent = "Script d'extraction prêt.";
    
    // Effectuer une première extraction rapide des commentaires déjà chargés
    await extractCurrentState();
    
  } catch (error) {
    console.error("Erreur d'initialisation :", error);
    statusMessage.textContent = "Erreur : " + error.message;
  }
});

// Événement : Extraire l'état actuel
btnExtractCurrent.addEventListener('click', async () => {
  await extractCurrentState();
});

// Défilement automatique supprimé (extraction manuelle uniquement)

// Enregistrer les données extraites dans le stockage local de l'extension
async function saveCommentsToStorage() {
  if (currentComments.length === 0) return;
  
  const postUrl = activeTab.url.split('?')[0];
  try {
    const result = await chrome.storage.local.get('scrapedPosts');
    const scrapedPosts = result.scrapedPosts || {};
    
    // Enregistrer ou mettre à jour la publication
    scrapedPosts[postUrl] = {
      url: postUrl,
      users: currentComments,
      scrapedAt: Date.now()
    };
    
    await chrome.storage.local.set({ scrapedPosts });
    console.log("Publication sauvegardée localement dans le stockage de l'extension.");
  } catch (e) {
    console.error("Erreur lors de la sauvegarde locale :", e);
  }
}

// Événement : Lancer la roulette
btnLaunchRoulette.addEventListener('click', async () => {
  if (currentComments.length === 0) return;
  
  statusMessage.textContent = "Ouverture de la Roulette...";
  
  try {
    // Sauvegarder une dernière fois pour être sûr
    await saveCommentsToStorage();
    
    const targetUrl = "http://localhost:3000/";
    
    // Ouvrir l'application dans un nouvel onglet
    await chrome.tabs.create({ url: targetUrl });
    statusMessage.textContent = "Lancement réussi !";
  } catch (error) {
    console.error("Erreur de lancement :", error);
    statusMessage.textContent = "Erreur de lancement : " + error.message;
  }
});

// Fonction utilitaire d'extraction de l'état actuel
async function extractCurrentState() {
  statusMessage.textContent = "Extraction en cours...";
  btnExtractCurrent.disabled = true;
  btnLaunchRoulette.disabled = true;
  try {
    const response = await chrome.tabs.sendMessage(activeTab.id, { action: "extract_comments" });
    if (response && response.success) {
      currentComments = response.comments || [];
      updateUI();
      const methodStr = response.method === "graphql" ? "via API" : "via DOM";
      statusMessage.textContent = `Extraction réussie (${currentComments.length} participants, ${methodStr}).`;
    } else {
      statusMessage.textContent = response ? response.error : "Aucun commentaire trouvé.";
    }
  } catch (error) {
    console.error("Erreur d'extraction :", error);
    statusMessage.textContent = "Erreur de communication : veuillez réactualiser l'onglet Instagram.";
  } finally {
    btnExtractCurrent.disabled = false;
  }
}

// Mettre à jour l'interface utilisateur
function updateUI() {
  commentCountEl.textContent = currentComments.length;
  
  // Activer le bouton de lancement de roulette si on a des commentaires
  if (currentComments.length > 0) {
    btnLaunchRoulette.disabled = false;
    btnLaunchRoulette.textContent = `Lancer le tirage sur ${currentComments.length} users`;
    
    // Afficher l'aperçu
    entrantListEl.innerHTML = '';
    entrantListEl.style.display = 'flex';
    
    // Afficher les 5 premiers pour ne pas surcharger le popup
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
    
    // Sauvegarder automatiquement les données à chaque extraction réussie
    saveCommentsToStorage();
  } else {
    btnLaunchRoulette.disabled = true;
    btnLaunchRoulette.textContent = "Lancer la Roulette";
    entrantListEl.style.display = 'none';
  }
}

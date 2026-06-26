// Service worker d'arrière-plan pour l'extension compagnon Instagram Giveaway
chrome.runtime.onInstalled.addListener(() => {
  console.log("L'extension compagnon Instagram Giveaway a été installée avec succès.");
});

// Intercepter les requêtes HTTP pour contourner les restrictions CSP d'Instagram
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetch_api") {
    console.log(`background.js: fetch_api vers ${request.url}`);

    fetch(request.url, {
      method: request.method || "GET",
      headers: request.headers || {},
      credentials: "include"
    })
      .then(async (response) => {
        const text = await response.text();
        sendResponse({
          success: true,
          status: response.status,
          statusText: response.statusText,
          text: text
        });
      })
      .catch((error) => {
        console.error("background.js: Erreur de fetch", error);
        sendResponse({
          success: false,
          error: error.message
        });
      });

    return true; // Conserver le canal de communication ouvert pour la réponse asynchrone
  } else if (request.action === "fetch_image_base64") {
    console.log(`background.js: fetch_image_base64 vers ${request.url}`);
    
    fetch(request.url, {
      method: "GET",
      referrerPolicy: "no-referrer"
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const buffer = await response.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = "";
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        
        sendResponse({
          success: true,
          base64: `data:image/jpeg;base64,${base64}`
        });
      })
      .catch((error) => {
        console.error("background.js: Erreur de conversion image en base64 jpg", error);
        sendResponse({
          success: false,
          error: error.message
        });
      });
      
    return true; // Conserver le canal de communication ouvert pour la réponse asynchrone
  }
});

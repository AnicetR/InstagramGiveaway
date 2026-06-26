<template>
  <div class="flex flex-col items-center justify-center text-center px-6 h-full space-y-4">
    <div class="relative w-12 h-12">
      <div class="absolute inset-0 rounded-full border-4 border-white/[0.05]"></div>
      <div class="absolute inset-0 rounded-full border-4 border-t-emerald-500 border-r-emerald-500 animate-spin shadow-[0_0_15px_rgba(16,185,129,0.3)]"></div>
    </div>
    <h3 class="text-sm font-bold font-outfit text-slate-200">En attente de l'extension...</h3>
    <p class="text-[10px] text-slate-400 max-w-[220px] leading-relaxed">
      Installez l'extension compagnon pour extraire gratuitement les commentaires depuis Instagram.
    </p>
    
    <!-- Download links -->
    <div class="w-full space-y-2 pt-2">
      <a 
        :href="`${config.app.baseURL}downloads/extension-chrome.zip`" 
        download="instagram-giveaway-companion-chrome.zip"
        class="w-full flex items-center justify-center gap-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 text-slate-200 text-[10px] py-2.5 px-4 rounded-xl transition font-semibold"
      >
        <Icon name="mdi:google-chrome" class="w-4 h-4 text-emerald-400" />
        Télécharger pour Chrome (.zip)
      </a>
      <a 
        :href="`${config.app.baseURL}downloads/extension-firefox.zip`" 
        download="instagram-giveaway-companion-firefox.zip"
        class="w-full flex items-center justify-center gap-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 text-slate-200 text-[10px] py-2.5 px-4 rounded-xl transition font-semibold"
      >
        <Icon name="mdi:firefox" class="w-4 h-4 text-orange-400" />
        Télécharger pour Firefox (.zip)
      </a>
    </div>
    
    <button 
      @click="$emit('load-demo')"
      class="text-slate-500 hover:text-slate-300 text-[9px] underline transition-all font-semibold pt-1"
    >
      Activer le mode Démo
    </button>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()

defineEmits<{
  (e: 'load-demo'): void
}>()
</script>

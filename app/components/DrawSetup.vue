<template>
  <div class="flex flex-col h-full px-5 py-6 justify-between select-none">
    <div class="space-y-6">
      <div class="text-center space-y-1">
        <h3 class="text-base font-bold font-outfit text-slate-200">Conditions du Tirage</h3>
        <p class="text-[10px] text-slate-400 truncate max-w-full px-4">{{ formatPostUrl(selectedPost.url) }}</p>
      </div>
      
      <div class="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-3.5 text-center space-y-2">
        <div class="flex items-center justify-center gap-2">
          <img :src="selectedAccount.avatar" class="w-8 h-8 rounded-full object-cover border border-slate-700" @error="handleAvatarError($event, selectedAccount.username)" />
          <div class="text-left">
            <div class="text-[11px] font-bold text-sky-400">{{ selectedAccount.username }}</div>
            <div class="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
              <span>✓</span> {{ selectedAccount.followers?.length || 0 }} abonnés importés
            </div>
          </div>
        </div>
        
        <div class="border-t border-white/5 pt-2 flex items-center justify-between text-[10px] text-slate-400">
          <span>Participants chargés :</span>
          <span class="font-bold text-emerald-400">{{ selectedPost.users?.length || 0 }}</span>
        </div>
      </div>
      
      <!-- Eligibility Rules Toggles inside the simulator -->
      <div class="space-y-3">
        <button 
          @click="$emit('toggle-rule', 'likes')" 
          class="w-full flex items-center justify-between p-3.5 rounded-2xl border text-xs font-semibold transition-all duration-300"
          :class="checkLikes 
            ? 'bg-rose-500/15 border-rose-500/30 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.1)] backdrop-blur-md' 
            : 'bg-white/[0.02] border-white/5 text-slate-500'"
        >
          <div class="flex items-center gap-2">
            <Icon :name="checkLikes ? 'mdi:heart' : 'mdi:heart-outline'" class="w-4 h-4" />
            Doit aimer la publication
          </div>
          <span v-if="checkLikes" class="text-[9px] bg-rose-500/20 px-2 py-0.5 rounded-full font-mono font-bold">Actif</span>
        </button>
        
        <button 
          @click="$emit('toggle-rule', 'followers')" 
          class="w-full flex items-center justify-between p-3.5 rounded-2xl border text-xs font-semibold transition-all duration-300"
          :class="checkFollowers 
            ? 'bg-sky-500/15 border-sky-500/30 text-sky-300 shadow-[0_0_15px_rgba(14,165,233,0.1)] backdrop-blur-md' 
            : 'bg-white/[0.02] border-white/5 text-slate-500'"
        >
          <div class="flex items-center gap-2">
            <Icon :name="checkFollowers ? 'mdi:account-star' : 'mdi:account-outline'" class="w-4 h-4" />
            Doit être abonné
          </div>
          <span v-if="checkFollowers" class="text-[9px] bg-sky-500/20 px-2 py-0.5 rounded-full font-mono font-bold">Actif</span>
        </button>
      </div>
    </div>
    
    <div class="space-y-2">
      <button 
        @click="$emit('launch')"
        class="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold py-3.5 px-4 rounded-2xl transition transform active:scale-[0.98] shadow-lg shadow-emerald-500/10 text-xs font-mono tracking-wider uppercase"
      >
        Lancer le Tirage
      </button>
      <button 
        @click="$emit('back')"
        class="w-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 text-slate-300 font-semibold py-3 px-4 rounded-2xl transition text-xs"
      >
        Retour aux publications
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ScrapedAccount, ScrapedPost } from '~/stores/giveaway'

defineProps<{
  selectedAccount: ScrapedAccount
  selectedPost: ScrapedPost
  checkLikes: boolean
  checkFollowers: boolean
}>()

defineEmits<{
  (e: 'toggle-rule', rule: 'likes' | 'followers'): void
  (e: 'launch'): void
  (e: 'back'): void
}>()
</script>

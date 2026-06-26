<template>
  <div class="flex flex-col h-full px-5 py-6 justify-between select-none">
    <div class="flex-1 flex flex-col min-h-0">
      <div class="text-center space-y-1 mb-5 flex-shrink-0">
        <div class="flex items-center justify-center gap-1.5 mb-1 bg-white/[0.03] border border-white/5 py-1 px-3.5 rounded-full w-max mx-auto">
          <img :src="selectedAccount.avatar" class="w-4 h-4 rounded-full object-cover border border-slate-700" @error="handleAvatarError($event, selectedAccount.username)" />
          <span class="text-[9px] font-black text-sky-400">{{ selectedAccount.username }}</span>
        </div>
        <h3 class="text-base font-bold font-outfit text-slate-100">Sélectionner un Concours</h3>
        <p class="text-[10px] text-slate-400">Publications de commentaires associées</p>
      </div>
      
      <div class="flex-1 overflow-y-auto pr-1 space-y-2.5 min-h-0">
        <div v-if="posts.length === 0" class="flex flex-col items-center justify-center py-16 text-center space-y-3">
          <div class="w-10 h-10 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center text-slate-500">
            📸
          </div>
          <p class="text-[10px] text-slate-500 max-w-[180px] leading-relaxed">
            Aucun post importé pour ce compte. Allez sur une publication de ce créateur dans Instagram et cliquez sur l'extension.
          </p>
        </div>
        
        <div 
          v-else
          v-for="post in posts" 
          :key="post.url"
          class="bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 rounded-2xl p-3 flex items-center justify-between transition cursor-pointer"
          @click="$emit('select', post)"
        >
          <div class="flex-1 min-w-0 pr-2">
            <div class="text-[11px] font-bold text-emerald-400 truncate">{{ formatPostUrl(post.url) }}</div>
            <div class="flex gap-2 text-[9px] text-slate-400 mt-1">
              <span>💬 {{ post.users?.length || 0 }} commentaires</span>
              <span>⏱️ {{ formatTimeAgo(post.scrapedAt) }}</span>
            </div>
          </div>
          <button 
            @click.stop="$emit('delete', post.url)"
            class="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 hover:border-red-500/40 text-red-400 transition"
          >
            <Icon name="mdi:trash-can-outline" class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
    
    <div class="pt-3">
      <button 
        @click="$emit('back')"
        class="w-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 text-slate-300 font-semibold py-3 px-4 rounded-2xl transition text-xs"
      >
        Retour aux comptes
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ScrapedAccount, ScrapedPost } from '~/stores/giveaway'

defineProps<{
  selectedAccount: ScrapedAccount
  posts: ScrapedPost[]
}>()

defineEmits<{
  (e: 'select', post: ScrapedPost): void
  (e: 'delete', url: string): void
  (e: 'back'): void
}>()
</script>

<template>
  <div class="flex flex-col h-full px-5 py-6 justify-between select-none">
    <div class="flex-1 flex flex-col min-h-0">
      <div class="text-center space-y-1 mb-5 flex-shrink-0">
        <h3 class="text-base font-bold font-outfit text-slate-100">Sélectionner un Compte</h3>
        <p class="text-[10px] text-slate-400">Comptes avec abonnés extraits</p>
      </div>
      
      <div class="flex-1 overflow-y-auto pr-1 space-y-2.5 min-h-0">
        <div v-if="accounts.length === 0" class="flex flex-col items-center justify-center py-16 text-center space-y-3">
          <div class="w-10 h-10 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center text-slate-500">
            👥
          </div>
          <p class="text-[10px] text-slate-500 max-w-[180px] leading-relaxed">
            Aucun compte créateur importé. Allez sur le profil du créateur dans Instagram et cliquez sur l'extension pour extraire ses abonnés.
          </p>
        </div>
        
        <div 
          v-else
          v-for="account in accounts" 
          :key="account.username"
          class="bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 rounded-2xl p-3 flex items-center justify-between transition cursor-pointer"
          @click="$emit('select', account)"
        >
          <div class="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
            <img :src="account.avatar" class="w-8 h-8 rounded-full object-cover border border-slate-700" />
            <div class="flex-1 min-w-0">
              <div class="text-[11px] font-bold text-sky-400 truncate">{{ account.username }}</div>
              <div class="text-[9px] text-slate-455 mt-0.5">
                <span>👥 {{ account.followers?.length || 0 }} abonnés</span>
              </div>
            </div>
          </div>
          <button 
            @click.stop="$emit('delete', account.username)"
            class="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 hover:border-red-500/40 text-red-400 transition"
          >
            <Icon name="mdi:trash-can-outline" class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  accounts: any[]
}>()

defineEmits<{
  (e: 'select', account: any): void
  (e: 'delete', username: string): void
}>()
</script>

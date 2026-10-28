<script setup lang="ts">
definePageMeta({ layout: 'game', title: 'Feedback' });

const MAX_LENGTH = 1000;
const games = ['General', '2048', 'Sudoku'];

const game = ref('General');
const message = ref('');
const website = ref(''); 
const status = ref<'idle' | 'sending' | 'sent' | 'error'>('idle');

async function send() {
  if (!message.value.trim() || status.value === 'sending') return;

  status.value = 'sending';
  try {
    await $fetch('/api/feedback', {
      method: 'POST',
      body: { game: game.value, message: message.value, website: website.value }
    });
    status.value = 'sent';
    message.value = '';
  } catch {
    status.value = 'error';
  }
}
</script>

<template>
  <div v-if="status === 'sent'" class="flex flex-col items-start gap-4">
    <p class="text-text">Thanks! Your feedback was sent.</p>
    <button
      class="px-3 py-2 font-semibold text-sm text-text border border-border rounded-md
             hover:bg-[#262626] active:scale-95 transition"
      @click="status = 'idle'"
    >
      Send another
    </button>
  </div>

  <form v-else class="flex flex-col gap-4" @submit.prevent="send">
    <p class="text-sm text-text-sub">Found a bug or have an idea? Tell me.</p>

    <label class="flex flex-col gap-1 text-sm text-text-sub">
      About
      <select
        v-model="game"
        class="px-3 py-2 text-text bg-primary border border-border rounded-md"
      >
        <option v-for="option in games" :key="option" :value="option">{{ option }}</option>
      </select>
    </label>

    <label class="flex flex-col gap-1 text-sm text-text-sub">
      Message
      <textarea
        v-model="message"
        rows="6"
        :maxlength="MAX_LENGTH"
        required
        class="px-3 py-2 text-text bg-primary border border-border rounded-md resize-y"
      />
      <span class="self-end text-xs">{{ message.length }} / {{ MAX_LENGTH }}</span>
    </label>

    <input v-model="website" type="text" name="website" tabindex="-1" autocomplete="off" class="hidden" aria-hidden="true">

    <p v-if="status === 'error'" class="text-sm text-red-400">Something went wrong. Please try again.</p>

    <button
      type="submit"
      :disabled="!message.trim() || status === 'sending'"
      class="py-2 font-semibold text-sm bg-white text-primary rounded-md
             hover:bg-[#CCCCCC] active:scale-95 transition
             disabled:opacity-30 disabled:pointer-events-none"
    >
      {{ status === 'sending' ? 'Sending…' : 'Send' }}
    </button>
  </form>
</template>

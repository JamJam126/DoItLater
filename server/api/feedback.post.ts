const MAX_LENGTH = 1000;

export default defineEventHandler(async event => {
  const body = await readBody(event);

  if (body?.website) return { ok: true };

  const message = String(body?.message ?? '').trim();
  const game = String(body?.game ?? 'General').trim().slice(0, 30);

  if (!message || message.length > MAX_LENGTH) {
    throw createError({ statusCode: 400, statusMessage: `Message must be 1–${MAX_LENGTH} characters` });
  }

  const { telegramBotToken, telegramChatId } = useRuntimeConfig(event);
  if (!telegramBotToken || !telegramChatId) {
    throw createError({ statusCode: 500, statusMessage: 'Feedback is not set up yet' });
  }

  try {
    await $fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
      method: 'POST',
      body: { chat_id: telegramChatId, text: `Feedback (${game})\n\n${message}` }
    });
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Could not send feedback' });
  }

  return { ok: true };
});

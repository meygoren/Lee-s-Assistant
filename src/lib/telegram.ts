// Telegram Bot API — https://core.telegram.org/bots/api#sendmessage
// Sent as plain text (no parse_mode) so digest content with markdown-style
// formatting (from Claude) never trips Telegram's strict escaping rules.
export async function pushToTelegram(chatId: string, text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error("Telegram push skipped: TELEGRAM_BOT_TOKEN is not set");
    return false;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text.slice(0, 4000),
      }),
    });
    const data = await res.json().catch(() => null);
    return Boolean(data?.ok);
  } catch (err) {
    console.error("Telegram push failed:", err);
    return false;
  }
}

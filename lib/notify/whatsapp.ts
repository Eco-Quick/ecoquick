// Sends a WhatsApp message via CallMeBot (free, personal-use API — no
// business account needed). Requires CALLMEBOT_PHONE and CALLMEBOT_API_KEY
// to be set; silently no-ops if they aren't configured yet.
export async function sendWhatsAppAlert(text: string): Promise<void> {
  const phone = process.env.CALLMEBOT_PHONE;
  const apiKey = process.env.CALLMEBOT_API_KEY;

  if (!phone || !apiKey) {
    console.warn("[whatsapp] CALLMEBOT_PHONE / CALLMEBOT_API_KEY not set — skipping alert:", text);
    return;
  }

  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apiKey)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error("[whatsapp] CallMeBot request failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error("[whatsapp] CallMeBot request errored:", err);
  }
}

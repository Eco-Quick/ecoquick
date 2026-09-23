import { logError } from "@/lib/error-log";

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
    const body = await res.text();

    // CallMeBot returns non-error-looking HTTP statuses (e.g. 208) even when
    // the message was NOT actually delivered — e.g. the bot being paused.
    // A real success always contains "Message queued"; anything else is a
    // silent failure unless we check the body ourselves.
    const delivered = res.ok && body.includes("Message queued");
    if (!delivered) {
      console.error("[whatsapp] CallMeBot did not deliver:", res.status, body);
      await logError("whatsapp-alert", `CallMeBot returned ${res.status} (not delivered): ${body.slice(0, 500)}`);
    }
  } catch (err) {
    console.error("[whatsapp] CallMeBot request errored:", err);
    await logError("whatsapp-alert", err instanceof Error ? err.message : String(err));
  }
}

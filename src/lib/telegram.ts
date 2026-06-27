export async function sendTelegramMessage(message: string): Promise<void> {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || import.meta.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || import.meta.env.TELEGRAM_CHAT_ID;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('Telegram Bot Token or Chat ID not configured. Notification skipped.');
    return;
  }

  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const chatIds = TELEGRAM_CHAT_ID.split(',').map(id => id.trim()).filter(id => id !== '');

  for (const chatId of chatIds) {
    try {
      const resp = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML'
        })
      });
      if (!resp.ok) {
        const errBody = await resp.text();
        console.error(`Telegram bot API error for chat ID ${chatId}:`, errBody);
      } else {
        console.log(`Telegram notification sent successfully to chat ID ${chatId}.`);
      }
    } catch (err) {
      console.error(`Failed to send Telegram notification to chat ID ${chatId}:`, err);
    }
  }
}

export const PACKAGE_INCLUSIONS: Record<string, string[]> = {
	"Set A Lechon Package": [
		"1 whole Lechon Baboy",
		"1 tray Buttered Shrimps",
		"100 pieces Lumpia Shanghai",
		"1 tray Chicken Cordon Bleu",
		"1 tray Special Bam-e",
		"1 tray Diniguan",
		"1 tray Spicy Buffalo Chicken"
	],
	"Set B Lechon Package": [
		"1 whole Lechon Baboy",
		"1 tray Buttered Shrimps",
		"150 pieces Lumpia Shanghai",
		"1 tray Chicken Cordon Bleu",
		"1 tray Special Bam-e",
		"1 tray Diniguan",
		"1 tray Spicy Buffalo Chicken",
		"1 tray Calamares"
	],
	"Set C Lechon Package": [
		"1 whole Lechon Baboy",
		"1 tray Buttered Shrimps",
		"200 pieces Lumpia Shanghai",
		"1 tray Chicken Cordon Bleu",
		"1 tray Special Bam-e",
		"1 tray Diniguan",
		"1 tray Spicy Buffalo Chicken",
		"1 tray Calamares",
		"1 tray Chicken Guisado"
	],
	"P1 Package (Bilao)": [
		"1 whole Lechon Manok",
		"30 pieces Pork Lumpia",
		"10 pieces Battered Chicken",
		"1/2 kilo Buttered Shrimps",
		"25 pieces Calamares",
		"Half tray Special Bam-i",
		"1 tray Chosen Dessert"
	],
	"P2 Package (Bilao)": [
		"3 kilos Lechon Belly",
		"30 pieces Pork Lumpia",
		"10 pieces Battered Chicken",
		"1/2 kilo Buttered Shrimps",
		"25 pieces Calamares",
		"Half tray Special Bam-i",
		"1 tray Chosen Dessert"
	],
	"P3 Package (Bilao)": [
		"4 kilos Lechon Belly",
		"40 pieces Pork Lumpia",
		"15 pieces Battered Chicken",
		"10 pieces Buffalo / Teriyaki Chicken",
		"3/4 kilo Buttered Shrimps",
		"40 pieces Calamares",
		"1 tray Special Bam-i",
		"1 tray Chosen Dessert"
	],
	"P4 Package (Bilao)": [
		"5 kilos Lechon Belly",
		"50 pieces Pork Lumpia",
		"20 pieces Battered Chicken",
		"15 pieces Buffalo / Teriyaki Chicken",
		"3/4 kilo Buttered Shrimps",
		"50 pieces Calamares",
		"1 tray Special Bam-i",
		"1 tray Chosen Dessert"
	],
	"P5 Package (Bilao)": [
		"6 kilos Lechon Belly",
		"70 pieces Pork Lumpia",
		"25 pieces Battered Chicken",
		"20 pieces Buffalo / Teriyaki Chicken",
		"1 kilo Buttered Shrimps",
		"60 pieces Calamares",
		"1 tray Special Bam-i",
		"1 tray Chosen Dessert"
	],
	"P6 Package (Bilao)": [
		"7 kilos Lechon Belly",
		"80 pieces Pork Lumpia",
		"30 pieces Battered Chicken",
		"25 pieces Buffalo / Teriyaki Chicken",
		"1 kilo Buttered Shrimps",
		"70 pieces Calamares",
		"1 tray Special Bam-i",
		"1 tray Chosen Dessert"
	]
};

export function getInclusionsForTelegram(itemName: string, customInclusions: string[] | null | undefined): string[] {
  if (customInclusions && customInclusions.length > 0) {
    return customInclusions;
  }
  for (const key in PACKAGE_INCLUSIONS) {
    if (itemName.toLowerCase().includes(key.toLowerCase()) || 
        (key.startsWith('P') && itemName.toLowerCase().includes(key.toLowerCase().split(' ')[0] + ' package'))) {
      return PACKAGE_INCLUSIONS[key];
    }
  }
  return [];
}

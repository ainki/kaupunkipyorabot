import { message } from "telegraf/filters";
import { bot } from "./bot.ts";
import {
  handleAsemaCommand,
  handleAsemaSelection,
  handlePendingAsemaInput,
} from "./asema.ts";
import { handleSijainti } from "./sijainti.ts";
import { startKeyboard } from "./helpers.ts";
import { getAllStations, updateCron } from "./jobs/asemat.ts";

bot.on(message("text"), async (ctx) => {
  const text = ctx.message.text;
  if (text === "/start") {
    await ctx.reply(
      `*Hei ${ctx.from.first_name}!* 👋🏻\n\n` +
      `Olen kaupunkipyöräbot. Löydän sulle kaupunkipyöräasemat. Checkkaa ohjeet alta:\n\n` +
      `*/asema*\nEtsi asemaa aseman koodilla tai nimellä. Saat vasteukseksi aseman sijainnin ja tämänhetkisen tilan.\n\n` +
      `*Sijainti 📍*\nLähetä sijainti ja saat lähimmät kaupunkipyöräasemat ja niiden tiedot.\n\n` +
      `• Tutustu kaupunkipyöriin osoitteessa kaupunkipyorat.hsl.fi\n• HSL Aikataulut @pysakkibot\n\n` +
      `Törmäillään – Kaupunkipyöräbot out 🚲💨\n\nData: © Digitransit ${new Date().getFullYear()}`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          keyboard: startKeyboard,
          resize_keyboard: true,
        },
      },
    );
  } else if (text.startsWith("/asema")) {
    await handleAsemaCommand(ctx);
  } else if (await handlePendingAsemaInput(ctx)) {
    return;
  } else if (/^\d{3}$/.test(text.trim())) {
    await handleAsemaCommand(ctx);
  } else {
    await ctx.reply("Komentoa ei löydy. Käytä /start aloittaaksesi.");
  }
});

bot.on("location", async (ctx) => {
  handleSijainti(ctx);
});

bot.on("callback_query", async (ctx) => {
  if (await handleAsemaSelection(ctx)) {
    return;
  }
});

const launchBot = async () => {
  console.log("Launching...");
  console.log("Running initial setup...");
  await getAllStations();
  try {
    await bot.launch(() => {
      console.log("Bot launched successfully.");
      console.log("Setting up station update cron job...");
      updateCron();
      console.log("Station update cron job set up.");
    });
  } catch (error) {
    console.error("Error launching bot:", error);
  }
};

launchBot();


import { request } from "graphql-request";
import type { Context } from "telegraf";
import { digitransitApiUrl } from "./helpers.ts";
import { startKeyboard } from "./helpers.ts";
import { searchStationByName } from "./jobs/asemat.ts";
import type { AsemaStore, VehicleRentalStation } from "./types/asemat.d.ts";

type VehicleRentalStationQueryResult = {
  vehicleRentalStation: VehicleRentalStation | null;
};

const pendingAsemaChats = new Set<number>();
const ASEMA_SELECTION_PREFIX = "asema_select:";

const getChatId = (ctx: Context) => ctx.chat?.id ?? ctx.from?.id;
const getMessageText = (ctx: Context) => {
  const incomingMessage = ctx.message;
  if (!incomingMessage || !("text" in incomingMessage)) {
    return "";
  }
  return incomingMessage.text;
};

const handleAsemaCommand = async (ctx: Context) => {
  ctx.sendChatAction("typing");
  const text = getMessageText(ctx);
  const query = text.replace(/^\/asema(@\w+)?/i, "").trim();
  const chatId = getChatId(ctx) || 0;

  if (query && !/^\d{3}$/.test(query)) {
    return await handleStationSearch(ctx, query);
  }

  if (query) {
    pendingAsemaChats.delete(chatId);
    const response = await queryAsema(query);
    const asema = parseAsemaResponse(response);

    if (!asema) {
      await ctx.reply(
        `Asemaa _${query}_ ei löytynyt. Varmista, että kirjoitit aseman koodin tai nimen oikein.`,
        { parse_mode: "Markdown" },
      );
      return true;
    }
    const message = await createAsemaMessage(asema);
    await ctx.reply(message, { parse_mode: "Markdown" });
    await ctx.sendLocation(asema.lat, asema.lon);
    return;
  }

  pendingAsemaChats.add(chatId);
  await ctx.reply("Anna aseman koodi tai nimi.", {
    reply_markup: {
      force_reply: true,
      input_field_placeholder: "Esim. 101 tai Kaivopuisto",
    },
  });
};

const handleStationSearch = async (ctx: Context, query: string) => {
  const stations = searchStationByName(query) as AsemaStore[];

  if (!stations.length) {
    await ctx.reply(
      `Asemaa _${query}_ ei löytynyt 😔`,
      { parse_mode: "Markdown" },
    );
    return true;
  }

  if (stations.length > 1) {
    const inline_keyboard = stations.slice(0, 10).map((station) => {
      const stationCode = parseAsemaCode(station.stationId) ?? station.stationId;
      return [{
        text: `${station.name} (${stationCode})`,
        callback_data: `${ASEMA_SELECTION_PREFIX}${station.stationId}`,
      }];
    });

    await ctx.reply("Löytyi useita asemia, valitse oikea:", {
      reply_markup: { inline_keyboard },
    });
    return true;
  }

  const response = await queryAsema(stations[0].stationId);
  const asema = parseAsemaResponse(response);

  if (!asema) {
    await ctx.reply(
      `Asemaa _${query}_ ei löytynyt 😔`,
      { parse_mode: "Markdown" },
    );
    return true;
  }

  const message = await createAsemaMessage(asema);
  await ctx.reply(message, { parse_mode: "Markdown" });
  await ctx.sendLocation(asema.lat, asema.lon);
  return true;
};

const handleAsemaSelection = async (ctx: Context) => {
  ctx.sendChatAction("typing");
  const callbackQuery = ctx.callbackQuery;
  if (!callbackQuery || !("data" in callbackQuery)) {
    return false;
  }

  const data = callbackQuery.data;
  if (!data.startsWith(ASEMA_SELECTION_PREFIX)) {
    return false;
  }

  const stationId = data.replace(ASEMA_SELECTION_PREFIX, "");
  await ctx.answerCbQuery();

  const response = await queryAsema(stationId);
  const asema = parseAsemaResponse(response);

  if (!asema) {
    await ctx.reply("Valittua asemaa ei löytynyt 😔");
    return true;
  }

  const message = await createAsemaMessage(asema);
  await ctx.reply(message, { parse_mode: "Markdown", reply_markup: { keyboard: startKeyboard, resize_keyboard: true } });
  await ctx.sendLocation(asema.lat, asema.lon);
  return true;
};

const handlePendingAsemaInput = async (ctx: Context) => {
  ctx.sendChatAction("typing");
  const chatId = getChatId(ctx) || 0;

  if (!pendingAsemaChats.has(chatId)) {
    return false;
  }

  const text = getMessageText(ctx).trim();
  if (!text || text.startsWith("/")) {
    return false;
  }

  if (!/^\d{3}$/.test(text)) {
    pendingAsemaChats.delete(chatId);
    return await handleStationSearch(ctx, text);
  }

  pendingAsemaChats.delete(chatId);
  const response = await queryAsema(text);
  const asema = parseAsemaResponse(response);

  if (!asema) {
    await ctx.reply(
      `Asemaa _${text}_ ei löytynyt 😔`,
      { parse_mode: "Markdown" },
    );
    return true;
  }

  const message = await createAsemaMessage(asema);

  await ctx.reply(message, {
    parse_mode: "Markdown",
    reply_markup: {
      keyboard: startKeyboard,
      resize_keyboard: true,
    },
  });
  await ctx.sendLocation(asema.lat, asema.lon);
  return true;
};

const queryAsema = async (text: string) => {
  const stationId = text.startsWith("smoove:") ? text : `smoove:${text}`;
  const query = `
  {
    vehicleRentalStation(id: "${stationId}") {
      operative
      stationId
      name
      availableVehicles {
        total
      }
      availableSpaces {
        total
      }
      capacity
      lat
      lon
      rentalNetwork {
        networkId
      }
    }
  }`;
  return request<VehicleRentalStationQueryResult>(digitransitApiUrl, query)
    .catch((error) => {
      console.error("Error fetching station:", error);
      return { vehicleRentalStation: null };
    });
};

const parseAsemaResponse = (
  response: VehicleRentalStationQueryResult | null | undefined,
): VehicleRentalStation | null => {
  if (
    !response ||
    !response.vehicleRentalStation ||
    !response.vehicleRentalStation.name
  ) {
    return null;
  }
  return response.vehicleRentalStation;
};

const parseAsemaCode = (text: string) => {
  const match = text.match(/smoove:(\w+)/i);
  return match ? match[1] : null;
};

const rentalNetworkParser = (networkId: string) => {
  switch (networkId) {
    case "smoove":
      return "Helsinki ja Espoo";
    default:
      return networkId;
  }
};

const createAsemaMessage = async (asema: VehicleRentalStation) => {
  if (asema.operative) {
    return (
      `*${asema.name}*\n` +
      `${rentalNetworkParser(asema.rentalNetwork.networkId)} ${parseAsemaCode(asema.stationId)}\n\n` +
      `Pyöriä asemalla juuri nyt *${asema.availableVehicles.total}*/${asema.capacity}`
    );
  } else {
    return (
      `*${asema.name}* (${asema.stationId})\n\n` + `Asema on pois käytöstä`
    );
  }
};

export { handleAsemaCommand, handlePendingAsemaInput, handleAsemaSelection };

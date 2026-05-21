import { request } from "graphql-request";
import type { Context } from "telegraf";
import { digitransitApiUrl } from "./helpers.ts";
import type { NearbyStationEdge, NearbyStationsResponse } from "./types/asemat.d.ts";

type KeyboardButton = {
  text: string;
  request_location?: boolean;
};

const handleSijainti = async (ctx: Context) => {
  ctx.sendChatAction("typing");
  const incomingMessage = ctx.message;
  if (!incomingMessage || !("location" in incomingMessage)) {
    return ctx.reply("Sijaintia ei saatu. Yritä uudelleen jakamalla sijaintisi.");
  }
  const lat = incomingMessage.location.latitude;
  const lon = incomingMessage.location.longitude;
  const stations = await queryNearbyStations(lat, lon);
  const edges = stations?.places?.edges || [];
  if (edges.length === 0) {
    return ctx.reply("Lähistöltä ei löytynyt kaupunkipyöräasemia. 😕");
  }
  const message = buildSijaintiMessage(edges);
  const keyboard = buildSijaintiKeyboard(edges);
  await ctx.reply(message, {
    parse_mode: "Markdown",
    reply_markup: {
      keyboard: keyboard,
      resize_keyboard: true,
    },
  });
  return;
};

const queryNearbyStations = async (
  lat: number,
  lon: number,
): Promise<NearbyStationsResponse> => {
  const query = `{
    places: nearest(
      lat: ${lat}
      lon: ${lon}
      maxDistance: 1500
      maxResults: 4
      filterByPlaceTypes: VEHICLE_RENT
    ) {
      edges {
        node {
          distance
          place {
            ... on BikeRentalStation {
              stationId
              name
              spacesAvailable
              bikesAvailable
              capacity
              operative
            }
          }
        }
      }
    }
  }`;
  return request<NearbyStationsResponse>(digitransitApiUrl, query)
    .catch((error) => {
      console.error("Error fetching nearby stations:", error);
      return { places: { edges: [] } };
    });
};

const buildSijaintiKeyboard = (edges: NearbyStationEdge[]): KeyboardButton[][] => {
  const results: KeyboardButton[][] = [
    edges.map((edge) => {
      const station = edge.node.place;
      return {
        text: `${station.stationId}`,
      };
    })
  ];
  results.push([
    { text: '/asema' },
    { text: 'Sijaintisi mukaan 📍', request_location: true }
  ]);
  return results;
};

const buildSijaintiMessage = (edges: NearbyStationEdge[]) => {
  let message = "Lähimmät kaupunkipyöräasemat:\n\n";
  edges.forEach((edge) => {
    const station = edge.node.place;
    message += `*${station.name}* ${station.stationId} – ${Math.round(edge.node.distance)}m\nPyöriä asemalla juuri nyt *${station.bikesAvailable}*/${station.capacity}\n\n`;
  });
  return message;
};

export { handleSijainti };
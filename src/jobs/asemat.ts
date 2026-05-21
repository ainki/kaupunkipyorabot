import { request } from "graphql-request";
import { digitransitApiUrl } from "../helpers.ts";
import nodeCron from "node-cron";
import type { AsemaStore } from "../types/asemat.d.ts";

const allStations: AsemaStore[] = []

const updateCron = async () => {
  nodeCron.schedule("0 */3 * * *", async () => {
    console.log("Updating stations...");
    await updateAllStations();
    console.log("Stations updated.");
  });
}

const getAllStations = async (): Promise<void> => {
  const response = await queryAllStations();
  allStations.push(...response);
  return;
}

const updateAllStations = async (): Promise<void> => {
  const response = await queryAllStations();
  allStations.length = 0;
  allStations.push(...response);
  return;
}

const queryAllStations = async (): Promise<AsemaStore[]> => {
  const query = `{
    vehicleRentalStations {
      id
      stationId
      name
      lat
      lon
    }
  }`;
  const response = await request(digitransitApiUrl, query)
    .catch((error) => {
      console.error("Error fetching stations:", error);
      return { vehicleRentalStations: [] };
    });
  return response.vehicleRentalStations;
}

const searchStationByName = (name: string): AsemaStore[] => {
  return allStations.filter((station: AsemaStore) =>
    station.name.toLowerCase().includes(name.toLowerCase())
  );
}

export { getAllStations, searchStationByName, updateCron };
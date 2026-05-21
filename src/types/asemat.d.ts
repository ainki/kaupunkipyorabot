export interface AsemaTotalCount {
	total: number
}

export interface AsemaNetwork {
	networkId: string
}

export interface VehicleRentalStation {
	operative: boolean
	stationId: string
	name: string
	availableVehicles: AsemaTotalCount
	availableSpaces: AsemaTotalCount
	capacity: number
	lat: number
	lon: number
  rentalNetwork: AsemaNetwork
}

export interface VehicleRentalStationResponse {
	data: {
		vehicleRentalStation: VehicleRentalStation
	}
}

export interface AsemaStore {
  id: string;
  stationId: string;
  name: string;
  lat: number;
  lon: number;
}

export interface NearbyBikeRentalStation {
	stationId: string;
	name: string;
	spacesAvailable: number;
	bikesAvailable: number;
	capacity: number;
	operative: boolean;
}

export interface NearbyStationEdge {
	node: {
		distance: number;
		place: NearbyBikeRentalStation;
	};
}

export interface NearbyStationsResponse {
	places: {
		edges: NearbyStationEdge[];
	};
}

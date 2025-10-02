export type EventType =
	| "LoadPage"
	| "LoadAdModule"
	| "auctionInit"
	| "auctionEnd"
	| "bidRequested"
	| "bidResponse"
	| "bidWon";

type DeviceType = "mobile" | "desktop" | "tablet";

export type EventElement = {
	eventType: EventType;

	timestamp: string;

	countryCode: string;
	deviceType: DeviceType;

	adapter: string | null;
	creativeId: string | null;
	cpm: number | null;
};

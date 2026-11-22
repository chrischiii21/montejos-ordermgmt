// Preset service areas for delivery fees: every barangay of Argao, Sibonga and Dalaguete.
// Source: PhilAtlas (philatlas.com) municipal pages — Argao 45, Sibonga 25, Dalaguete 33 barangays.
// In Settings → Pickup & Delivery Fees the owner types a fee only for the areas they serve
// (e.g. the highway barangays of Sibonga and Dalaguete); areas left blank are not offered to customers.

export interface TownAreas { town: string; barangays: string[] }

export const SERVICE_AREA_TOWNS: TownAreas[] = [
	{
		town: 'Argao',
		barangays: [
			'Alambijud', 'Anajao', 'Apo', 'Balaas', 'Balisong', 'Binlod', 'Bogo', 'Bug-ot', 'Bulasa', 'Butong',
			'Calagasan', 'Canbantug', 'Canbanua', 'Cansuje', 'Capio-an', 'Casay', 'Catang', 'Colawin', 'Conalum',
			'Guiwanon', 'Gutlang', 'Jampang', 'Jomgao', 'Lamacan', 'Langtad', 'Langub', 'Lapay', 'Lengigon',
			'Linut-od', 'Mabasa', 'Mandilikit', 'Mompeller', 'Panadtaran', 'Poblacion', 'Sua', 'Sumaguan',
			'Tabayag', 'Talaga', 'Talaytay', 'Talo-ot', 'Tiguib', 'Tulang', 'Tulic', 'Ubaub', 'Usmad'
		]
	},
	{
		town: 'Sibonga',
		barangays: [
			'Abugon', 'Bae', 'Bagacay', 'Bahay', 'Banlot', 'Basak', 'Bato', 'Cagay', 'Can-aga', 'Candaguit',
			'Cantolaroy', 'Dugoan', 'Guimbangco-an', 'Lamacan', 'Libo', 'Lindogon', 'Magcagong', 'Manatad',
			'Mangyan', 'Papan', 'Poblacion', 'Sabang', 'Sayao', 'Simala', 'Tubod'
		]
	},
	{
		town: 'Dalaguete',
		barangays: [
			'Ablayan', 'Babayongan', 'Balud', 'Banhigan', 'Bulak', 'Caleriohan', 'Caliongan', 'Casay', 'Catolohan',
			'Cawayan', 'Consolacion', 'Coro', 'Dugyan', 'Dumalan', 'Jolomaynon', 'Lanao', 'Langkas', 'Lumbang',
			'Malones', 'Maloray', 'Mananggal', 'Manlapay', 'Mantalongon', 'Nalhub', 'Obo', 'Obong', 'Panas',
			'Poblacion', 'Sacsac', 'Salug', 'Tabon', 'Tapun', 'Tuba'
		]
	}
];

/** Shop location (Montejo's Lechon & Food Trays – ARGAO), from the Google Maps link https://maps.app.goo.gl/tpPZND67MFNe7EAu5 */
export const SHOP_LOCATION = { lat: 9.8684581, lon: 123.5819746 };

/**
 * Road distance and driving time from the shop to each barangay (key "Barangay|Town").
 * Computed once (Nov 2026): barangay points from OpenStreetMap Nominatim, road distances from the
 * OSRM routing service over OpenStreetMap roads. Measured to the barangay's map point (usually its
 * centre or barangay hall), so treat it as an estimate. Guimbangco-an and Libo (Sibonga) could not be
 * located reliably and have no distance.
 */
export const AREA_DISTANCES: Record<string, { km: number; min: number }> = {
	'Alambijud|Argao': { km: 18.5, min: 22 },
	'Anajao|Argao': { km: 29.4, min: 25 },
	'Apo|Argao': { km: 27.9, min: 24 },
	'Balaas|Argao': { km: 18.6, min: 28 },
	'Balisong|Argao': { km: 4.9, min: 4 },
	'Binlod|Argao': { km: 7.3, min: 6 },
	'Bogo|Argao': { km: 1.7, min: 2 },
	'Bug-ot|Argao': { km: 2, min: 3 },
	'Bulasa|Argao': { km: 9.1, min: 7 },
	'Butong|Argao': { km: 20.6, min: 23 },
	'Calagasan|Argao': { km: 20.9, min: 25 },
	'Canbantug|Argao': { km: 14.7, min: 22 },
	'Canbanua|Argao': { km: 4.4, min: 4 },
	'Cansuje|Argao': { km: 13.6, min: 16 },
	'Capio-an|Argao': { km: 18.6, min: 17 },
	'Casay|Argao': { km: 4.8, min: 5 },
	'Catang|Argao': { km: 7.7, min: 10 },
	'Colawin|Argao': { km: 22.8, min: 19 },
	'Conalum|Argao': { km: 13.9, min: 17 },
	'Guiwanon|Argao': { km: 13, min: 10 },
	'Gutlang|Argao': { km: 20.8, min: 17 },
	'Jampang|Argao': { km: 8, min: 10 },
	'Jomgao|Argao': { km: 4.6, min: 6 },
	'Lamacan|Argao': { km: 2.1, min: 3 },
	'Langtad|Argao': { km: 4.7, min: 4 },
	'Langub|Argao': { km: 19.2, min: 16 },
	'Lapay|Argao': { km: 5.2, min: 8 },
	'Lengigon|Argao': { km: 23.9, min: 20 },
	'Linut-od|Argao': { km: 23.9, min: 27 },
	'Mabasa|Argao': { km: 16.5, min: 19 },
	'Mandilikit|Argao': { km: 14.8, min: 16 },
	'Mompeller|Argao': { km: 25.8, min: 22 },
	'Panadtaran|Argao': { km: 6.2, min: 8 },
	'Poblacion|Argao': { km: 3.3, min: 3 },
	'Sua|Argao': { km: 14.1, min: 15 },
	'Sumaguan|Argao': { km: 15.9, min: 13 },
	'Tabayag|Argao': { km: 7.7, min: 12 },
	'Talaga|Argao': { km: 3.3, min: 3 },
	'Talaytay|Argao': { km: 5.4, min: 6 },
	'Talo-ot|Argao': { km: 12.2, min: 9 },
	'Tiguib|Argao': { km: 6.4, min: 8 },
	'Tulang|Argao': { km: 20.3, min: 25 },
	'Tulic|Argao': { km: 0.5, min: 1 },
	'Ubaub|Argao': { km: 16.3, min: 20 },
	'Usmad|Argao': { km: 8.8, min: 11 },
	'Abugon|Sibonga': { km: 24.4, min: 24 },
	'Bae|Sibonga': { km: 30.2, min: 29 },
	'Bagacay|Sibonga': { km: 15.9, min: 12 },
	'Bahay|Sibonga': { km: 17.7, min: 13 },
	'Banlot|Sibonga': { km: 25.1, min: 22 },
	'Basak|Sibonga': { km: 30.5, min: 30 },
	'Bato|Sibonga': { km: 26.1, min: 21 },
	'Cagay|Sibonga': { km: 28.5, min: 28 },
	'Can-aga|Sibonga': { km: 26.6, min: 25 },
	'Candaguit|Sibonga': { km: 22.8, min: 21 },
	'Cantolaroy|Sibonga': { km: 30.1, min: 28 },
	'Dugoan|Sibonga': { km: 30.2, min: 28 },
	'Lamacan|Sibonga': { km: 22.2, min: 18 },
	'Lindogon|Sibonga': { km: 15.8, min: 14 },
	'Magcagong|Sibonga': { km: 23.6, min: 23 },
	'Manatad|Sibonga': { km: 24.9, min: 24 },
	'Mangyan|Sibonga': { km: 25.9, min: 24 },
	'Papan|Sibonga': { km: 28.6, min: 27 },
	'Poblacion|Sibonga': { km: 19.8, min: 15 },
	'Sabang|Sibonga': { km: 21.5, min: 18 },
	'Sayao|Sibonga': { km: 28.5, min: 27 },
	'Simala|Sibonga': { km: 13.7, min: 10 },
	'Tubod|Sibonga': { km: 20.5, min: 18 },
	'Ablayan|Dalaguete': { km: 32.7, min: 30 },
	'Babayongan|Dalaguete': { km: 35.2, min: 35 },
	'Balud|Dalaguete': { km: 16.9, min: 12 },
	'Banhigan|Dalaguete': { km: 11, min: 8 },
	'Bulak|Dalaguete': { km: 36.9, min: 51 },
	'Caleriohan|Dalaguete': { km: 33.9, min: 32 },
	'Caliongan|Dalaguete': { km: 25.1, min: 26 },
	'Casay|Dalaguete': { km: 6.9, min: 5 },
	'Catolohan|Dalaguete': { km: 29.6, min: 33 },
	'Cawayan|Dalaguete': { km: 9.7, min: 7 },
	'Consolacion|Dalaguete': { km: 18.2, min: 13 },
	'Coro|Dalaguete': { km: 13.2, min: 11 },
	'Dugyan|Dalaguete': { km: 35.7, min: 34 },
	'Dumalan|Dalaguete': { km: 32.3, min: 31 },
	'Jolomaynon|Dalaguete': { km: 19.5, min: 17 },
	'Lanao|Dalaguete': { km: 12.8, min: 14 },
	'Langkas|Dalaguete': { km: 30.3, min: 29 },
	'Lumbang|Dalaguete': { km: 9.8, min: 10 },
	'Malones|Dalaguete': { km: 11.6, min: 11 },
	'Maloray|Dalaguete': { km: 35.6, min: 33 },
	'Mananggal|Dalaguete': { km: 14.6, min: 13 },
	'Manlapay|Dalaguete': { km: 26.9, min: 30 },
	'Mantalongon|Dalaguete': { km: 27.8, min: 25 },
	'Nalhub|Dalaguete': { km: 27.1, min: 29 },
	'Obo|Dalaguete': { km: 23.7, min: 20 },
	'Obong|Dalaguete': { km: 19, min: 14 },
	'Panas|Dalaguete': { km: 10.3, min: 15 },
	'Poblacion|Dalaguete': { km: 15.2, min: 12 },
	'Sacsac|Dalaguete': { km: 18.7, min: 15 },
	'Salug|Dalaguete': { km: 37.2, min: 75 },
	'Tabon|Dalaguete': { km: 29.7, min: 27 },
	'Tapun|Dalaguete': { km: 14.4, min: 11 },
	'Tuba|Dalaguete': { km: 7.1, min: 8 }
};

export function areaDistance(name: string, town?: string | null): { km: number; min: number } | null {
	return town ? AREA_DISTANCES[`${name}|${town}`] ?? null : null;
}

/** How an area is shown and matched: "Bogo, Argao" for preset barangays, the plain name for custom areas. */
export function areaLabel(name: string, town?: string | null): string {
	return town ? `${name}, ${town}` : name;
}

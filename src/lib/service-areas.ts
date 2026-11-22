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

/** How an area is shown and matched: "Bogo, Argao" for preset barangays, the plain name for custom areas. */
export function areaLabel(name: string, town?: string | null): string {
	return town ? `${name}, ${town}` : name;
}

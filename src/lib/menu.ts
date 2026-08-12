export interface MenuItemDef {
	name: string;
	price: number;
}

export interface MenuCategoryDef {
	category: string;
	items: MenuItemDef[];
}

export const MENU_ITEMS: MenuCategoryDef[] = [
	{ category: "Set Lechon Packages", items: [
		{ name: "Set A Lechon Package", price: 15999.00 },
		{ name: "Set B Lechon Package", price: 18675.00 },
		{ name: "Set C Lechon Package", price: 19999.00 }
	]},
	{ category: "Belly Bilao Packages", items: [
		{ name: "P1 Package (Bilao)", price: 3100.00 },
		{ name: "P2 Package (Bilao)", price: 4400.00 },
		{ name: "P3 Package (Bilao)", price: 5400.00 },
		{ name: "P4 Package (Bilao)", price: 6100.00 },
		{ name: "P5 Package (Bilao)", price: 7900.00 },
		{ name: "P6 Package (Bilao)", price: 8500.00 }
	]},
	{ category: "Food Trays - Chicken", items: [
		{ name: "Battered Chicken (Tray)", price: 1000.00 },
		{ name: "Chicken Fillet (Tray)", price: 1200.00 },
		{ name: "Teriyaki Chicken (Tray)", price: 1200.00 },
		{ name: "Buffalo Chicken (Tray)", price: 1200.00 },
		{ name: "Chicken Ala King (Tray)", price: 1300.00 },
		{ name: "Sweet & Sour Chicken (Tray)", price: 1300.00 },
		{ name: "Chicken Adobo (Tray)", price: 1200.00 },
		{ name: "Chicken Cordon Bleu (Tray)", price: 1300.00 }
	]},
	{ category: "Food Trays - Seafood", items: [
		{ name: "Calamares (Tray)", price: 1200.00 },
		{ name: "Buttered Shrimps (Tray)", price: 1300.00 },
		{ name: "Shrimp Tempura (Tray)", price: 1500.00 },
		{ name: "Escabeche (Tray)", price: 1150.00 },
		{ name: "Fish Fillet (Tray)", price: 900.00 }
	]},
	{ category: "Food Trays - Pork", items: [
		{ name: "Lumpia Shanghai (100pcs)", price: 700.00 },
		{ name: "Lumpia Shanghai (200pcs)", price: 1275.00 },
		{ name: "Breaded Pork Chops (Tray)", price: 1300.00 },
		{ name: "Pork Tonkatsu (Tray)", price: 1300.00 },
		{ name: "Sweet & Sour Pork (Tray)", price: 1400.00 },
		{ name: "Grilled Pork Belly (Tray)", price: 1600.00 },
		{ name: "Pork Menudo (Tray)", price: 1500.00 }
	]},
	{ category: "Food Trays - Pasta & Noodle", items: [
		{ name: "Special Bam-i (Tray)", price: 1000.00 },
		{ name: "Filipino Style Spaghetti (Tray)", price: 1000.00 },
		{ name: "Classic Carbonara (Tray)", price: 1000.00 },
		{ name: "Tuna Carbonara (Tray)", price: 1150.00 }
	]},
	{ category: "Food Trays - Veggie & Dessert", items: [
		{ name: "Chopseuy (Tray)", price: 1200.00 },
		{ name: "Fruit Salad (Tray)", price: 800.00 },
		{ name: "Fruit Macaroni Salad (Tray)", price: 800.00 },
		{ name: "Chicken Macaroni Salad (Tray)", price: 800.00 },
		{ name: "Buko Pandan (Tray)", price: 800.00 },
		{ name: "Creamy Mango Float (Tray)", price: 800.00 },
		{ name: "Creamy Coffee Jelly (Tray)", price: 800.00 },
		{ name: "Crema de Fruta (Tray)", price: 800.00 },
		{ name: "Creamy Maja Blanca (Tray)", price: 800.00 }
	]},
	{ category: "Whole Lechon (A la carte)", items: [
		{ name: "Family Lechon (XS)", price: 9999.00 },
		{ name: "Barkada Lechon (S)", price: 11500.00 },
		{ name: "Jumbo Lechon (M)", price: 12300.00 },
		{ name: "Fiesta Lechon (L)", price: 13300.00 },
		{ name: "Grande Lechon (XL)", price: 14500.00 },
		{ name: "El' Grande Lechon (XXL)", price: 15300.00 }
	]},
	{ category: "Lechon Belly (A la carte)", items: [
		{ name: "Lechon Belly (4 Kilos)", price: 2649.00 },
		{ name: "Lechon Belly (5 Kilos)", price: 2999.00 },
		{ name: "Lechon Belly (6 Kilos)", price: 3499.00 },
		{ name: "Lechon Belly (7 Kilos)", price: 3999.00 },
		{ name: "Lechon Belly (8 Kilos)", price: 4499.00 },
		{ name: "Lechon Belly (9 Kilos)", price: 4999.00 },
		{ name: "Lechon Belly (10 Kilos)", price: 5599.00 }
	]},
	{ category: "Food Combos", items: [
		{ name: "SEAPORK Combo", price: 499.00 },
		{ name: "CHIXSEAPORK A Combo", price: 750.00 },
		{ name: "BAM-I + LUMPIA Combo", price: 850.00 },
		{ name: "CHIXSEAPORK B Combo", price: 1000.00 },
		{ name: "ALL-IN-ONE Combo", price: 999.00 },
		{ name: "FAMILY MEAL Combo", price: 1450.00 }
	]}
];

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

export function getInclusionsForForm(itemName: string): string[] | null {
	for (const key in PACKAGE_INCLUSIONS) {
		if (itemName.toLowerCase().includes(key.toLowerCase()) ||
			(key.startsWith('P') && itemName.toLowerCase().includes(key.toLowerCase().split(' ')[0] + ' package'))) {
			return [...PACKAGE_INCLUSIONS[key]];
		}
	}
	return null;
}

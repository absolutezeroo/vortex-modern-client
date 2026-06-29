/**
 * Furniture category type constants
 *
 * Based on AS3 com.sulake.habbo.inventory.enum.class_3518
 */
export const FurnitureCategory = {
	DEFAULT: 1,
	WALL_PAPER: 2,
	FLOOR: 3,
	LANDSCAPE: 4,
	POST_IT: 5,
	POSTER: 6,
	SOUND_SET: 7,
	TRAX_SONG: 8,
	PRESENT: 9,
	ECOTRON_BOX: 10,
	TROPHY: 11,
	CREDIT_FURNI: 12,
	PET_SHAMPOO: 13,
	PET_CUSTOM_PART: 14,
	PET_CUSTOM_PART_SHAMPOO: 15,
	PET_SADDLE: 16,
	GUILD_FURNI: 17,
	GAME_FURNI: 18,
	MONSTERPLANT_SEED: 19,
	MONSTERPLANT_REVIVAL: 20,
	MONSTERPLANT_REBREED: 21,
	MONSTERPLANT_FERTILIZE: 22,
	FIGURE_PURCHASABLE_SET: 23,
} as const;

export type FurnitureCategoryType = typeof FurnitureCategory[keyof typeof FurnitureCategory];

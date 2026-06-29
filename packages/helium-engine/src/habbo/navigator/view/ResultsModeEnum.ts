/**
 * Navigator results display mode
 * Based on AS3 com.sulake.habbo.navigator.view.search.results.ResultsModeEnum
 */
export const ResultsModeEnum = {
	ROWS: 0,
	TILES: 1,
} as const;

export type ResultsMode = typeof ResultsModeEnum[keyof typeof ResultsModeEnum];

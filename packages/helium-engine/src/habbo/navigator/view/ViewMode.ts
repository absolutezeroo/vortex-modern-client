/**
 * Navigator view mode constants and utilities
 * Based on AS3 com.sulake.habbo.navigator.view.search.ViewMode
 */

// View code strings
export const ViewModeCode = {
	MYWORLD_VIEW: 'myworld_view',
	HOTEL_VIEW: 'hotel_view',
	OFFICIAL_VIEW: 'official_view',
	ROOM_ADS_VIEW: 'roomads_view',
	NEW_ADS_VIEW: 'new_ads',
	ADS_VIEW_PREFIX: 'eventcategory__',
} as const;

// View mode integers
export const ViewMode = {
	OFFICIAL_VIEW: 0,
	MY_WORLD_VIEW: 1,
	HOTEL_VIEW: 2,
	ROOM_AD_VIEW: 3,
	EVENT_VIEW: 4,
} as const;

export type ViewModeType = typeof ViewMode[keyof typeof ViewMode];

export function getViewMode(code: string): ViewModeType
{
	if (code === ViewModeCode.OFFICIAL_VIEW)
	{
		return ViewMode.OFFICIAL_VIEW;
	}
	if (code === ViewModeCode.MYWORLD_VIEW)
	{
		return ViewMode.MY_WORLD_VIEW;
	}
	if (code === ViewModeCode.ROOM_ADS_VIEW)
	{
		return ViewMode.ROOM_AD_VIEW;
	}
	if (code === ViewModeCode.NEW_ADS_VIEW)
	{
		return ViewMode.EVENT_VIEW;
	}
	if (code.indexOf(ViewModeCode.ADS_VIEW_PREFIX) === 0)
	{
		return ViewMode.EVENT_VIEW;
	}
	return ViewMode.HOTEL_VIEW;
}

export function isEventViewMode(mode: ViewModeType): boolean
{
	return mode === ViewMode.ROOM_AD_VIEW || mode === ViewMode.EVENT_VIEW;
}

/**
 * Room settings tracking event constants
 *
 * Based on AS3 com.sulake.habbo.navigator.events.HabboRoomSettingsTrackingEvent
 */
export const HabboRoomSettingsTrackingEvent = {
	CLOSED: 'HABBO_ROOM_SETTINGS_TRACKING_EVENT_CLOSED',
	DEFAULT: 'HABBO_ROOM_SETTINGS_TRACKING_EVENT_DEFAULT',
	ADVANCED: 'HABBO_ROOM_SETTINGS_TRACKING_EVENT_ADVANCED',
	THUMBS: 'HABBO_ROOM_SETTINGS_TRACKING_EVENT_THUMBS',
} as const;

export type HabboRoomSettingsTrackingEventType = (typeof HabboRoomSettingsTrackingEvent)[keyof typeof HabboRoomSettingsTrackingEvent];

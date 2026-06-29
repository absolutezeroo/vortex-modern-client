/**
 * Constants for login process tracking steps.
 *
 * Each step corresponds to a milestone in the client initialization process
 * that gets reported for analytics.
 *
 * @see source_as_win63/habbo/tracking/HabboLoginTrackingStep.as
 */
export const HabboLoginTrackingStep = {
	CONNECTION_INIT: 'client.init.socket.init',
	CONNECTION_ESTABLISHED: 'client.init.socket.ok',
	HANDSHAKING: 'client.init.handshake.start',
	HANDSHAKE_OK: 'client.init.handshake.ok',
	HANDSHAKE_FAIL: 'client.init.handshake.fail',
	AUTHENTICATED: 'client.init.auth.ok',
	ROOM_ENTER: 'client.init.room.enter',
	HOTELVIEW_LOAD_START: 'client.init.hotelview.start',
	HOTELVIEW_LOAD_OK: 'client.init.hotelview.ok',
	HOTELVIEW_LOAD_FAILED: 'client.init.hotelview.fail',
} as const;

export type HabboLoginTrackingStepType = typeof HabboLoginTrackingStep[keyof typeof HabboLoginTrackingStep];

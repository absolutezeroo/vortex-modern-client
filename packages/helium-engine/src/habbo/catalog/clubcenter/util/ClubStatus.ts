/**
 * Habbo Club subscription status values.
 *
 * @see sources/win63_version/habbo/catalog/clubcenter/util/ClubStatus.as
 */
export const ClubStatus = {
	ACTIVE: 'active',
	NONE: 'none',
	EXPIRED: 'expired',
} as const;

export type ClubStatusType = typeof ClubStatus[keyof typeof ClubStatus];

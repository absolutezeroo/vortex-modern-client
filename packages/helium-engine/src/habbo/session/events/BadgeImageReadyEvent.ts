/**
 * Badge image ready event
 *
 * @see source_as_win63/habbo/session/events/BadgeImageReadyEvent.as
 */
export class BadgeImageReadyEvent
{
	public static readonly BADGE_IMAGE_READY = 'BIRE_BADGE_IMAGE_READY';

	constructor(badgeId: string, badgeImage: unknown = null)
	{
		this._badgeId = badgeId;
		this._badgeImage = badgeImage;
	}

	private _badgeId: string;

	get badgeId(): string
	{
		return this._badgeId;
	}

	private _badgeImage: unknown;

	get badgeImage(): unknown
	{
		return this._badgeImage;
	}
}

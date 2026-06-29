import type {IWidget} from './IWidget';

/**
 * Interface for the badge image widget.
 *
 * Renders a badge image (normal, group, or perk) from a badge identifier.
 * Supports group badge live-refresh via message events.
 *
 * @see sources/win63_version/habbo/window/widgets/IBadgeImageWidget.as
 */
export interface IBadgeImageWidget extends IWidget
{
	/**
	 * The badge type: "normal", "group", or "perk".
	 */
	type: string;

	/**
	 * The badge identifier string.
	 */
	badgeId: string;

	/**
	 * The group ID for group-type badges. Set to 0 to disable.
	 */
	groupId: number;
}


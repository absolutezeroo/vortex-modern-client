import type {IWidget} from './IWidget';

/**
 * Interface for the avatar image widget.
 *
 * Renders an avatar figure with configurable direction, scale, cropping,
 * and head-only mode. Supports click-to-profile navigation via userId.
 *
 * @see sources/win63_version/habbo/window/widgets/IAvatarImageWidget.as
 */
export interface IAvatarImageWidget extends IWidget
{
	/**
	 * The avatar figure string (e.g. "hd-180-1.ch-210-66.lg-270-82.sh-290-81").
	 */
	figure: string;

	/**
	 * The rendering scale: "h" (normal) or "sh" (small/half).
	 */
	scale: string;

	/**
	 * Whether to render only the avatar head.
	 */
	onlyHead: boolean;

	/**
	 * Whether to use the cropped image variant.
	 */
	cropped: boolean;

	/**
	 * The avatar facing direction (0-7).
	 */
	direction: number;

	/**
	 * The user ID for click-to-profile behavior.
	 * Set to 0 to disable click handling.
	 */
	userId: number;
}


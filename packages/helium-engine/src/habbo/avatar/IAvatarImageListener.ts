/**
 * Listener interface for avatar image load completion.
 *
 * @see sources/win63_version/habbo/avatar/IAvatarImageListener.as
 */
export interface IAvatarImageListener
{
	disposed?: boolean;

	avatarImageReady(figureString: string): void;
}

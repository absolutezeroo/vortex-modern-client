/**
 * Help tutorial event constants
 *
 * Event types dispatched during the new user tutorial flow,
 * including avatar editor opening/closing and tutorial start.
 *
 * @see source_as_win63/habbo/help/enum/HabboHelpTutorialEvent.as
 */
export class HabboHelpTutorialEvent
{
	public static readonly AVATAR_TUTORIAL_START: string = 'HHTPNUFWE_AVATAR_TUTORIAL_START';
	public static readonly LIGHT_CLOTHES_ICON: string = 'HHTPNUFWE_LIGHT_CLOTHES_ICON';
	public static readonly DONE_AVATAR_EDITOR_OPENING: string = 'HHTE_DONE_AVATAR_EDITOR_OPENING';
	public static readonly DONE_AVATAR_EDITOR_CLOSING: string = 'HHTE_DONE_AVATAR_EDITOR_CLOSING';
}

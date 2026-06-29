/**
 * Chat bubble width constants and utility for mapping room chat settings
 * to corresponding bubble widths.
 *
 * @see source_as_win63/habbo/freeflowchat/viewer/enum/ChatBubbleWidth.as
 */
export class ChatBubbleWidth
{
	public static readonly NORMAL: number = 350;
	public static readonly THIN: number = 240;
	public static readonly WIDE: number = 2000;

	/**
	 * Returns the bubble width corresponding to the given room chat setting.
	 *
	 * @param setting The room chat bubble width setting (0=WIDE, 1=NORMAL, 2=THIN)
	 * @returns The bubble width in pixels
	 */
	static accordingToRoomChatSetting(setting: number): number
	{
		switch (setting)
		{
			case 0:
				return ChatBubbleWidth.WIDE;
			case 1:
				return ChatBubbleWidth.NORMAL;
			case 2:
				return ChatBubbleWidth.THIN;
			default:
				return ChatBubbleWidth.NORMAL;
		}
	}
}

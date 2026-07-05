/**
 * RoomWidgetRequestWidgetMessage
 *
 * @see sources/win63_version/habbo/ui/widget/messages/RoomWidgetRequestWidgetMessage.as
 */
import {RoomWidgetMessage} from './RoomWidgetMessage';

export class RoomWidgetRequestWidgetMessage extends RoomWidgetMessage
{
	public static readonly REQUEST_USER_CHOOSER: string = 'RWRWM_USER_CHOOSER';
	public static readonly REQUEST_FURNI_CHOOSER: string = 'RWRWM_FURNI_CHOOSER';
	public static readonly REQUEST_FURNI_CHOOSER_ADD: string = 'RWRWM_FURNI_CHOOSER_ADD';
	public static readonly REQUEST_ME_MENU: string = 'RWRWM_ME_MENU';
	public static readonly REQUEST_EFFECTS: string = 'RWRWM_EFFECTS';

	private _id: number;
	private _category: number;

	// AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetRequestWidgetMessage.as::RoomWidgetRequestWidgetMessage()
	constructor(type: string, id: number = 0, category: number = 0)
	{
		super(type);

		this._id = id;
		this._category = category;
	}

	public get id(): number
	{
		return this._id;
	}

	public get category(): number
	{
		return this._category;
	}
}

/**
 * RoomWidgetRoomObjectMessage
 *
 * @see sources/win63_version/habbo/ui/widget/messages/RoomWidgetRoomObjectMessage.as
 */
import {RoomWidgetMessage} from './RoomWidgetMessage';

export class RoomWidgetRoomObjectMessage extends RoomWidgetMessage
{
	// AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetRoomObjectMessage.as::GET_OBJECT_INFO
	public static readonly GET_OBJECT_INFO: string = 'RWROM_GET_OBJECT_INFO';

	// AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetRoomObjectMessage.as::GET_OBJECT_NAME
	public static readonly GET_OBJECT_NAME: string = 'RWROM_GET_OBJECT_NAME';

	// AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetRoomObjectMessage.as::const_1163
	public static readonly SELECT_OBJECT: string = 'RWROM_SELECT_OBJECT';

	// AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetRoomObjectMessage.as::GET_OWN_CHARACTER_INFO
	public static readonly GET_OWN_CHARACTER_INFO: string = 'RWROM_GET_OWN_CHARACTER_INFO';

	// AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetRoomObjectMessage.as::GET_AVATAR_LIST
	public static readonly GET_AVATAR_LIST: string = 'RWROM_GET_AVATAR_LIST';

	private _id: number;
	private _category: number;

	// AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetRoomObjectMessage.as::RoomWidgetRoomObjectMessage()
	constructor(type: string, id: number, category: number)
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

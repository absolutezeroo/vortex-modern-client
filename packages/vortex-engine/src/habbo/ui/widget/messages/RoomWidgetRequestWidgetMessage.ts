/**
 * RoomWidgetRequestWidgetMessage
 *
 * @see sources/win63_version/habbo/ui/widget/messages/RoomWidgetRequestWidgetMessage.as
 */
import {RoomWidgetMessage} from './RoomWidgetMessage';

export class RoomWidgetRequestWidgetMessage extends RoomWidgetMessage
{
    // AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetRequestWidgetMessage.as::REQUEST_USER_CHOOSER
    public static readonly REQUEST_USER_CHOOSER: string = 'RWRWM_USER_CHOOSER';
    // AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetRequestWidgetMessage.as::REQUEST_FURNI_CHOOSER
    public static readonly REQUEST_FURNI_CHOOSER: string = 'RWRWM_FURNI_CHOOSER';
    // AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetRequestWidgetMessage.as::REQUEST_FURNI_CHOOSER_ADD
    public static readonly REQUEST_FURNI_CHOOSER_ADD: string = 'RWRWM_FURNI_CHOOSER_ADD';
    // AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetRequestWidgetMessage.as::REQUEST_ME_MENU
    public static readonly REQUEST_ME_MENU: string = 'RWRWM_ME_MENU';
    // AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetRequestWidgetMessage.as::REQUEST_EFFECTS
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

    // AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetRequestWidgetMessage.as::get id()
    public get id(): number
    {
        return this._id;
    }

    // AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetRequestWidgetMessage.as::get category()
    public get category(): number
    {
        return this._category;
    }
}

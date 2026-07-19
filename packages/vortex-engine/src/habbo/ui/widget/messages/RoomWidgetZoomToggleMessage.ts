/**
 * RoomWidgetZoomToggleMessage
 *
 * @see sources/win63_version/habbo/ui/widget/messages/RoomWidgetZoomToggleMessage.as
 */
import {RoomWidgetMessage} from './RoomWidgetMessage';

export class RoomWidgetZoomToggleMessage extends RoomWidgetMessage
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetZoomToggleMessage.as::ZOOM_TOGGLE
    public static readonly ZOOM_TOGGLE: string = 'RWZTM_ZOOM_TOGGLE';

    // AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetZoomToggleMessage.as::RoomWidgetZoomToggleMessage()
    constructor()
    {
        super(RoomWidgetZoomToggleMessage.ZOOM_TOGGLE);
    }
}

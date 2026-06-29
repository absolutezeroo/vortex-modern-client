import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Updates room category and trade mode (used by EnforceCategoryCtrl modal).
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/roomsettings/UpdateRoomCategoryAndTradeSettingsComposer.as
 */
export class UpdateRoomCategoryAndTradeSettingsComposer extends MessageComposer<[number, number, number]>
{
    private _data: [number, number, number];

    constructor(roomId: number, categoryNodeId: number, tradeMode: number)
    {
        super();

        this._data = [roomId, categoryNodeId, tradeMode];
    }

    getMessageArray(): [number, number, number]
    {
        return this._data;
    }
}

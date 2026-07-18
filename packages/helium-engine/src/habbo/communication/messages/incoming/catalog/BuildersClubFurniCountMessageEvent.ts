import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {BuildersClubFurniCountMessageParser} from '../../parser/catalog/BuildersClubFurniCountMessageParser';

/**
 * Event handler for the builder's club furni count message - the reply to
 * BuildersClubQueryFurniCountMessageComposer.
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1716/_SafeCls_2251.as
 */
export class BuildersClubFurniCountMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, BuildersClubFurniCountMessageParser);
    }
}

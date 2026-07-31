import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {PetSupplementedNotificationEventParser} from '@habbo/communication/messages/parser/users/PetSupplementedNotificationEventParser';

/**
 * Someone gave a pet water, light or a treat (header 3858).
 *
 * AS3: sources/win63_version/habbo/communication/messages/incoming/users/PetSupplementedNotificationEvent.as (obfuscated in the primary dump as _SafeStr_4546[3858] = _SafeCls_3489, sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_3489.as)
 */
export class PetSupplementedNotificationEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, PetSupplementedNotificationEventParser);
    }
}

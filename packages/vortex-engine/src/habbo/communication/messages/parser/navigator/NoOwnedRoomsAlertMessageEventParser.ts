import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * NoOwnedRoomsAlertMessageEventParser
 *
 * The player has no room of their own. Carries no payload - it exists only to open
 * the room-creation flow.
 *
 * Name recovered from the emulator's `NoOwnedRoomsAlertMessageComposer = 735`; the AS3
 * class is obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2435/_SafeCls_4425.as
 */
export class NoOwnedRoomsAlertMessageEventParser implements IMessageParser
{
    // AS3: .../_SafeCls_4425.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: .../_SafeCls_4425.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        return true;
    }
}

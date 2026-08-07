import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    BadgeInformationParser
} from '@habbo/communication/messages/parser/inventory/badges/BadgeInformationParser';

/**
 * The server's answer to `GetBadgeInformationComposer`: one badge's rarity and owner count.
 *
 * Header 1153, from WIN63's registry (`_SafeStr_4546[1153] = _SafeCls_3875`). The emulator does
 * not implement it. Class name DERIVED: the identifier exists in no tree, and unlike its
 * `badges/` siblings it has no `win63_version` counterpart to recover the name from either.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2931/_SafeCls_3875.as
 */
export class BadgeInformationEvent extends MessageEvent implements IMessageEvent
{
    // AS3: .../src/unknowns/_SafePkg_2931/_SafeCls_3875.as::_SafeCls_3875()
    constructor(callback: MessageEventCallback)
    {
        super(callback, BadgeInformationParser);
    }
}
